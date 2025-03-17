import { DicomMetadataStore, IWebApiDataSource } from '@ohif/core';
import OHIF from '@ohif/core';
import { decompressFromEncodedURIComponent } from 'lz-string';
import dcmjs from 'dcmjs';

import getImageId from '../DicomWebDataSource/utils/getImageId';
import getDirectURL from '../utils/getDirectURL';

const { DicomMetaDictionary, DicomDict } = dcmjs.data;

const { denaturalizeDataset } = DicomMetaDictionary;

const ImplementationClassUID = '2.25.270695996825855179949881587723571202391.2.0.0';
const ImplementationVersionName = 'OHIF-VIEWER-2.0.0';
const EXPLICIT_VR_LITTLE_ENDIAN = '1.2.840.10008.1.2.1';

const STUDY_METADATA_URL_REGEX = /\/dicoms\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\.json$/;

const metadataProvider = OHIF.classes.MetadataProvider;

const mappings = {
  studyInstanceUid: 'StudyInstanceUID',
  patientId: 'PatientID',
};

let _store = {
  urls: [],
  studyInstanceUIDMap: new Map(), // map of urls to array of study instance UIDs
  // {
  //   url: url1
  //   studies: [Study1, Study2], // if multiple studies
  // }
  // {
  //   url: url2
  //   studies: [Study1],
  // }
  // }
};

function wrapSequences(obj) {
  return Object.keys(obj).reduce(
    (acc, key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively wrap sequences for nested objects
        acc[key] = wrapSequences(obj[key]);
      } else {
        acc[key] = obj[key];
      }
      if (key.endsWith('Sequence')) {
        acc[key] = OHIF.utils.addAccessors(acc[key]);
      }
      return acc;
    },
    Array.isArray(obj) ? [] : {}
  );
}
const getMetaDataByURL = url => {
  return _store.urls.find(metaData => metaData.url === url);
};

const findStudies = (key, value) => {
  let studies = [];
  _store.urls.map(metaData => {
    metaData.studies.map(aStudy => {
      if (aStudy[key] === value) {
        studies.push(aStudy);
      }
    });
  });
  return studies;
};

function getUrl(query) {
  return query.get('id') ? decompressFromEncodedURIComponent(query.get('id')) : query.get('url');
}

async function storeInstance({ dicomEndpoint, branchId, studyDate, buffer, authHeader }) {
  const dicomDict = dcmjs.data.DicomMessage.readFile(buffer);
  const instance = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict);
  const { StudyInstanceUID, SeriesInstanceUID, SOPInstanceUID } = instance;

  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'application/dicom' });
  const dcmFile = new File([blob], `${SOPInstanceUID}.dcm`, { type: 'application/dicom' });
  formData.append('DicomMeasurementFile', dcmFile);

  const endpoint = `${dicomEndpoint}/dicoms/${branchId}/${studyDate}/${StudyInstanceUID}/${SeriesInstanceUID}/${SOPInstanceUID}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: { ...authHeader },
  });

  if (!response.ok) {
    throw new Error('Cannot store instance');
  }
}

function createDicomJSONApi(dicomJsonConfig, servicesManager) {
  const { wadoRoot } = dicomJsonConfig;
  const { userAuthenticationService } = servicesManager.services;

  let dicomEndpoint, branchId, studyDate;

  const implementation = {
    initialize: async ({ query, url }) => {
      if (!url) {
        url = getUrl(query);
        if (STUDY_METADATA_URL_REGEX.test(url)) {
          const matches = url.match(STUDY_METADATA_URL_REGEX);
          dicomEndpoint = new URL(url).origin;
          branchId = matches[1];
          studyDate = matches[2];
        }
      }
      let metaData = getMetaDataByURL(url);

      // if we have already cached the data from this specific url
      // We are only handling one StudyInstanceUID to run; however,
      // all studies for patientID will be put in the correct tab
      if (metaData) {
        return metaData.studies.map(aStudy => {
          return aStudy.StudyInstanceUID;
        });
      }

      const headers = userAuthenticationService.getAuthorizationHeader();
      const response = await fetch(url, { headers });
      const data = await response.json();

      let StudyInstanceUID;
      let SeriesInstanceUID;
      data.studies.forEach(study => {
        StudyInstanceUID = study.StudyInstanceUID;

        study.series.forEach(series => {
          SeriesInstanceUID = series.SeriesInstanceUID;

          series.instances.forEach(instance => {
            const { url: imageId, metadata: naturalizedDicom } = instance;

            // Add imageId specific mapping to this data as the URL isn't necessarliy WADO-URI.
            metadataProvider.addImageIdToUIDs(imageId, {
              StudyInstanceUID,
              SeriesInstanceUID,
              SOPInstanceUID: naturalizedDicom.SOPInstanceUID,
            });
          });
        });
      });

      _store.urls.push({
        url,
        studies: [...data.studies],
      });
      _store.studyInstanceUIDMap.set(
        url,
        data.studies.map(study => study.StudyInstanceUID)
      );
    },
    query: {
      studies: {
        mapParams: () => {},
        search: async param => {
          const [key, value] = Object.entries(param)[0];
          const mappedParam = mappings[key];

          // todo: should fetch from dicomMetadataStore
          const studies = findStudies(mappedParam, value);

          return studies.map(aStudy => {
            return {
              accession: aStudy.AccessionNumber,
              date: aStudy.StudyDate,
              description: aStudy.StudyDescription,
              instances: aStudy.NumInstances,
              modalities: aStudy.Modalities,
              mrn: aStudy.PatientID,
              patientName: aStudy.PatientName,
              studyInstanceUid: aStudy.StudyInstanceUID,
              NumInstances: aStudy.NumInstances,
              time: aStudy.StudyTime,
            };
          });
        },
        processResults: () => {
          console.warn(' DICOMJson QUERY processResults not implemented');
        },
      },
      series: {
        // mapParams: mapParams.bind(),
        search: () => {
          console.warn(' DICOMJson QUERY SERIES SEARCH not implemented');
        },
      },
      instances: {
        search: () => {
          console.warn(' DICOMJson QUERY instances SEARCH not implemented');
        },
      },
    },
    retrieve: {
      /**
       * Generates a URL that can be used for direct retrieve of the bulkdata
       *
       * @param {object} params
       * @param {string} params.tag is the tag name of the URL to retrieve
       * @param {string} params.defaultPath path for the pixel data url
       * @param {object} params.instance is the instance object that the tag is in
       * @param {string} params.defaultType is the mime type of the response
       * @param {string} params.singlepart is the type of the part to retrieve
       * @param {string} params.fetchPart unknown?
       * @returns an absolute URL to the resource, if the absolute URL can be retrieved as singlepart,
       *    or is already retrieved, or a promise to a URL for such use if a BulkDataURI
       */
      directURL: params => {
        return getDirectURL(dicomJsonConfig, params);
      },
      series: {
        metadata: async ({ StudyInstanceUID, madeInClient = false, customSort } = {}) => {
          if (!StudyInstanceUID) {
            throw new Error('Unable to query for SeriesMetadata without StudyInstanceUID');
          }

          const study = findStudies('StudyInstanceUID', StudyInstanceUID)[0];
          let series;

          if (customSort) {
            series = customSort(study.series);
          } else {
            series = study.series;
          }

          const seriesSummaryMetadata = series.map(series => {
            const seriesSummary = {
              StudyInstanceUID: study.StudyInstanceUID,
              ...series,
            };
            delete seriesSummary.instances;
            return seriesSummary;
          });

          // Async load series, store as retrieved
          function storeInstances(naturalizedInstances) {
            DicomMetadataStore.addInstances(naturalizedInstances, madeInClient);
          }

          DicomMetadataStore.addSeriesMetadata(seriesSummaryMetadata, madeInClient);

          function setSuccessFlag() {
            const study = DicomMetadataStore.getStudy(StudyInstanceUID, madeInClient);
            study.isLoaded = true;
          }

          const numberOfSeries = series.length;
          series.forEach((series, index) => {
            const instances = series.instances.map(instance => {
              // for instance.metadata if the key ends with sequence then
              // we need to add a proxy to the first item in the sequence
              // so that we can access the value of the sequence
              // by using sequenceName.value
              const modifiedMetadata = wrapSequences(instance.metadata);

              const obj = {
                ...modifiedMetadata,
                url: instance.url,
                imageId: instance.url,
                ...series,
                ...study,
              };
              delete obj.instances;
              delete obj.series;
              return obj;
            });
            storeInstances(instances);
            if (index === numberOfSeries - 1) {
              setSuccessFlag();
            }
          });
        },
      },
    },
    store: {
      dicom: async (dataset, _request, dicomDict) => {
        if (!dicomEndpoint || !branchId || !studyDate) {
          return;
        }

        const authHeader = userAuthenticationService.getAuthorizationHeader();

        if (dataset instanceof ArrayBuffer) {
          await storeInstance({ dicomEndpoint, branchId, studyDate, buffer: dataset, authHeader });
        } else {
          let effectiveDicomDict = dicomDict;

          if (!dicomDict) {
            const meta = {
              FileMetaInformationVersion: dataset._meta?.FileMetaInformationVersion?.Value,
              MediaStorageSOPClassUID: dataset.SOPClassUID,
              MediaStorageSOPInstanceUID: dataset.SOPInstanceUID,
              TransferSyntaxUID: EXPLICIT_VR_LITTLE_ENDIAN,
              ImplementationClassUID,
              ImplementationVersionName,
            };

            const denaturalized = denaturalizeDataset(meta);
            const defaultDicomDict = new DicomDict(denaturalized);
            defaultDicomDict.dict = denaturalizeDataset(dataset);

            effectiveDicomDict = defaultDicomDict;
          }

          const part10Buffer = effectiveDicomDict.write();
          await storeInstance({
            dicomEndpoint,
            branchId,
            studyDate,
            buffer: part10Buffer,
            authHeader,
          });
        }
      },
    },
    deleteStudyMetadataPromise(...args) {
      console.log('deleteStudyMetadataPromise', args);
      console.log('deleteStudyMetadataPromise not implemented');
    },
    getImageIdsForDisplaySet(displaySet) {
      const images = displaySet.images;
      const imageIds = [];

      if (!images) {
        return imageIds;
      }

      displaySet.images.forEach(instance => {
        const NumberOfFrames = instance.NumberOfFrames;

        if (NumberOfFrames > 1) {
          for (let i = 1; i <= NumberOfFrames; i++) {
            const imageId = getImageId({
              instance,
              frame: i,
              config: dicomJsonConfig,
            });
            imageIds.push(imageId);
          }
        } else {
          const imageId = getImageId({ instance, config: dicomJsonConfig });
          imageIds.push(imageId);
        }
      });

      return imageIds;
    },
    getImageIdsForInstance({ instance, frame }) {
      const imageIds = getImageId({ instance, frame });
      return imageIds;
    },
    getStudyInstanceUIDs: ({ params, query }) => {
      const url = getUrl(query);
      return _store.studyInstanceUIDMap.get(url);
    },
  };
  return IWebApiDataSource.create(implementation);
}

export { createDicomJSONApi };

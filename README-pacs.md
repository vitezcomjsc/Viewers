# PACS Viewer

This project is a fork of [OHIF Viewers](https://github.com/OHIF/Viewers).

It is synced with version 3.8.1 (stable version at the time of writing) at commit hash [1a57e54](https://github.com/OHIF/Viewers/commit/1a57e54f74a24f5dcf87e3bd48ee9711d0ab48d2).

It is recommended to walkthrough [Introduction | OHIF](https://docs.ohif.org/)
in order to understand the project structure and how it works.

## Configuration

There is a configuration file for PACS at [here](platform/app/public/config/pacs.js).

For more information, please head to [Config files | OHIF](https://docs.ohif.org/configuration/configurationFiles).

## Development

Please find details about development at [Getting Started | OHIF](https://docs.ohif.org/development/getting-started).

To build a distribution, please specify the configuration file as below:

**Note:**

- `--skip-nx-cache` is specified for a fresh build.
- `QUICK_BUILD=true` is specified to build without source maps.

```
QUICK_BUILD=true APP_CONFIG=config/pacs.js yarn build --skip-nx-cache
```

## Deployment

After building a distribution, there will be a `dist` folder inside [`platform/app`](platform/app).

The folder can be served as static assets.

Please find more ways to deploy at [Deployment | OHIF](https://docs.ohif.org/deployment/).

## FAQs

### How the Viewers retrieves study and display?

The PACS Portal will redirect to the Viewers with `id` as query parameter as below:

```
https://viewer.fodicom.com/viewer?id=[STUDY_ID]&token=[TOKEN]
```

- The query `token` will be persisted into [Session Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
and removed immediately from the URL once the Viewer loaded.

- The query `id` is actually a URL to the study metadata in the JSON file but
compressed using `compressToEncodedURIComponent` in library [lz-string](https://www.npmjs.com/package/lz-string).

The Viewers will display study and series using data in the JSON file as we
defined DICOM JSON as the default data source in the [PACS config file](platform/app/public/config/pacs.js).

For more information about DICOM JSON, please head to [DICOM JSON | OHIF](https://docs.ohif.org/configuration/dataSources/dicom-json).

### How to add/remove tools on toolbar, left sidebar?

We are using `@ohif/mode-longitudinal`, so tools are defined in:

- [`modes/longitudinal/src/toolbarButtons.ts`](modes/longitudinal/src/toolbarButtons.ts):
This file contains definitions of each tool including its label, icon, and command.

- [`modes/longitudinal/src/index.ts`](modes/longitudinal/src/index.ts):
This file contains how and where tools will be displayed. Tools defined in the
`primary` section will be displayed on the toolbar, `sidebar-image-tools`,
`sidebar-other-tools` and `sidebar-info-tools` sections will be displayed on
the **Image Tools**, **Tools** and **Information** panels on the left sidebar, respectively.

### How Reload button (Reload Series) works?

The Reload button will refetch the study URL (decompressed from the query parameter `id`)
with the query parameter `overrideGenerated=true`.

Please find the implementation [here](platform/ui/src/components/StudyItem/StudyItem.tsx#L28-L50).

### How Create Report works?

The Viewers will build a DCM file with all measurements and findings using [dcmjs](https://www.npmjs.com/package/dcmjs).
Then it will upload it to the server. In concept, the server will store the DCM file
in the corresponding study folder and re-generate the study metadata JSON file.

Please find the implementation below:

- [storeInstance@extensions/default/src/DicomJSONDataSource/index.js](extensions/default/src/DicomJSONDataSource/index.js#L77-L97)
- [store.dicom@extensions/default/src/DicomJSONDataSource/index.js](extensions/default/src/DicomJSONDataSource/index.js#L284-L322)

### How Upload and Copy Image works?

The Viewers will upload an image to the server, and receive a public link.

The public link will be written into user's clipboard and used to include in the
editor in the PACS Portal.

Please find the implemetation below:

- [uploadAndCopyBlob@extensions/cornerstone/src/utils/CornerstoneViewportDownloadForm.tsx](extensions/cornerstone/src/utils/CornerstoneViewportDownloadForm.tsx#L224-L254)
- [uploadAndCopy@platform/ui/src/components/ViewportDownloadForm/ViewportDownloadForm.tsx](platform/ui/src/components/ViewportDownloadForm/ViewportDownloadForm.tsx#L104-L123)

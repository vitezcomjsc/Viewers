import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { decompressFromEncodedURIComponent } from 'lz-string';

import Icon from '../Icon';
import Button from '../Button';

const baseClasses =
  'first:border-0 border-t border-secondary-light cursor-pointer select-none outline-none';

const StudyItem = ({
  date,
  description,
  numInstances,
  modalities,
  trackedSeries,
  isActive,
  onClick,
  measurementService,
  userAuthenticationService,
}) => {
  const { t } = useTranslation('StudyItem');

  const [isReloading, setIsReloading] = React.useState(false);

  const reload = () => {
    const measurements = measurementService.getMeasurements();
    if (measurements.length > 0) {
      const isConfirmed = window.confirm(
        'You have unsaved measurements/ findings. Are you sure you want to reload?'
      );

      if (!isConfirmed) {
        return;
      }
    }

    const studyId = new URL(window.location.href).searchParams.get('id');
    if (studyId) {
      const headers = userAuthenticationService.getAuthorizationHeader();
      const studyMetadataUrl = new URL(decompressFromEncodedURIComponent(studyId));
      studyMetadataUrl.searchParams.append('overrideGenerated', 'true');

      setIsReloading(true);
      void fetch(studyMetadataUrl, { headers }).finally(() => window.location.reload());

      return;
    }

    window.location.reload();
  };

  return (
    <div
      className={classnames(
        isActive ? 'bg-secondary-dark' : 'hover:bg-secondary-main bg-black',
        baseClasses
      )}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex="0"
    >
      <div className="flex flex-col items-center pt-2 pb-2 text-center">
        <div className="truncate text-sm text-white">{date}</div>
        <div className="text-sm text-blue-300">{modalities}</div>
        <div className="break-words text-sm text-blue-300">{description}</div>
        <div className="text-sm text-blue-300">{numInstances} instances</div>
        <Button
          disabled={isReloading}
          size="small"
          className="mt-2 w-min"
          onClick={e => {
            e.stopPropagation();
            reload();
          }}
        >
          <Icon
            name="tool-reset"
            className="h-5 w-5"
          />
          {!isReloading && t('Reload')}
          {isReloading && t('Reloading...')}
        </Button>
      </div>
      {!!trackedSeries && (
        <div className="flex-2 flex">
          <div
            className={classnames(
              'bg-secondary-main mt-2 flex flex-row py-1 pl-2 pr-4 text-xs text-white ',
              isActive
                ? 'border-secondary-light flex-1 justify-center border-t'
                : 'mx-4 mb-4 rounded-sm'
            )}
          >
            <Icon
              name="tracked"
              className="text-primary-light mr-2 w-4"
            />
            {t('Tracked series', { trackedSeries: trackedSeries })}
          </div>
        </div>
      )}
    </div>
  );
};

StudyItem.propTypes = {
  date: PropTypes.string.isRequired,
  description: PropTypes.string,
  modalities: PropTypes.string.isRequired,
  numInstances: PropTypes.number.isRequired,
  trackedSeries: PropTypes.number,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  measurementService: PropTypes.shape({
    getMeasurements: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
    EVENTS: PropTypes.object.isRequired,
    VALUE_TYPES: PropTypes.object.isRequired,
  }).isRequired,
  userAuthenticationService: PropTypes.shape({
    getAuthorizationHeader: PropTypes.func.isRequired,
  }).isRequired,
};

export default StudyItem;

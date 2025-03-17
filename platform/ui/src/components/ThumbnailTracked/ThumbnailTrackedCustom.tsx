import React from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import Icon from '../Icon';
import Tooltip from '../Tooltip';
import ThumbnailTracked from './ThumbnailTracked';
import ThumbnailCustom from '../Thumbnail/ThumbnailCustom';

function ThumbnailTrackedCustom({
  displaySetInstanceUID,
  className,
  imageSrc,
  imageAltText,
  description,
  seriesNumber,
  numInstances,
  countIcon,
  messages,
  dragData,
  onClick,
  onDoubleClick,
  onClickUntrack,
  isTracked,
  isActive,
}) {
  const { t } = useTranslation('ThumbnailTracked');
  const trackedIcon = isTracked ? 'circled-checkmark' : 'dotted-circle';

  return (
    <div
      className={classnames('flex flex-1 cursor-pointer flex-row pr-2 outline-none', className)}
      id={`thumbnail-${displaySetInstanceUID}`}
    >
      <div className="flex-2 flex flex-col items-center">
        <div
          className={classnames(
            'relative mb-2 flex cursor-pointer flex-col items-center justify-start p-2',
            isTracked && 'rounded-sm hover:bg-gray-900'
          )}
        >
          <Tooltip
            position="left"
            content={
              <div className="flex flex-1 flex-row">
                <div className="flex-2 flex items-center justify-center pr-4">
                  <Icon
                    name="info-link"
                    className="text-primary-active"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <span>
                    <span className="text-white">
                      {isTracked ? t('Series is tracked') : t('Series is untracked')}
                    </span>
                  </span>
                </div>
              </div>
            }
          >
            <Icon
              name={trackedIcon}
              className="text-primary-light mb-2 w-4"
            />
          </Tooltip>
        </div>
        {isTracked && (
          <div onClick={onClickUntrack}>
            <Icon
              name="cancel"
              className="text-primary-active w-4"
            />
          </div>
        )}
      </div>
      <ThumbnailCustom
        displaySetInstanceUID={displaySetInstanceUID}
        imageSrc={imageSrc}
        imageAltText={imageAltText}
        dragData={dragData}
        description={description}
        seriesNumber={seriesNumber}
        messages={messages}
        numInstances={numInstances}
        countIcon={countIcon}
        isActive={isActive}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
}

ThumbnailTrackedCustom.propTypes = ThumbnailTracked.propTypes;

export default ThumbnailTrackedCustom;

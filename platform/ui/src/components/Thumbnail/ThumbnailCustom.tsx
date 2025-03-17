import React, { useState } from 'react';
import classnames from 'classnames';
import { useDrag } from 'react-dnd';

import Icon from '../Icon';
import DisplaySetMessageListTooltip from '../DisplaySetMessageListTooltip';
import Thumbnail from './Thumbnail';

const ThumbnailCustom = ({
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
  isActive,
  onClick,
  onDoubleClick,
}): React.ReactNode => {
  // TODO: We should wrap our thumbnail to create a "DraggableThumbnail", as
  // this will still allow for "drag", even if there is no drop target for the
  // specified item.
  const [collectedProps, drag, dragPreview] = useDrag({
    type: 'displayset',
    item: { ...dragData },
    canDrag: function (monitor) {
      return Object.keys(dragData).length !== 0;
    },
  });

  const [lastTap, setLastTap] = useState(0);

  const handleTouchEnd = e => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      onDoubleClick(e);
    } else {
      onClick(e);
    }
    setLastTap(currentTime);
  };

  return (
    <div
      className={classnames(
        className,
        'group mb-1 flex flex-1 cursor-pointer select-none flex-col outline-none'
      )}
      id={`thumbnail-${displaySetInstanceUID}`}
      data-cy={`study-browser-thumbnail`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex="0"
    >
      <div ref={drag}>
        <div
          className={classnames(
            'h-26 relative flex flex-1 items-center justify-center overflow-hidden rounded-md bg-black text-base text-white',
            isActive
              ? 'border-primary-light border-2'
              : 'border-secondary-light border hover:border-blue-300'
          )}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAltText}
              className="h-full w-full object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <div>{imageAltText}</div>
          )}

          <div className="absolute top-0 left-0 flex h-full w-full flex-col justify-between">
            <div className="bg-overlay40 truncate break-all px-1 text-xs text-white">
              {description}
            </div>
            <div className="flex flex-col gap-2 text-xs text-blue-300">
              <DisplaySetMessageListTooltip
                position="left"
                messages={messages}
                id={`display-set-tooltip-${displaySetInstanceUID}`}
              />

              <div className="bg-overlay40 flex items-center justify-between px-1 pb-0.5">
                <p>
                  <Icon
                    className="mr-1 inline-block h-3 w-3"
                    name={countIcon || 'group-layers'}
                  />
                  <span>{numInstances}</span>
                </p>
                <p>
                  <span className="font-bold">S: </span>
                  <span>{seriesNumber}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ThumbnailCustom.propTypes = Thumbnail.propTypes;

ThumbnailCustom.defaultProps = Thumbnail.defaultProps;

export default ThumbnailCustom;

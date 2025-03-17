import React, { useState } from 'react';
import classnames from 'classnames';
import { useDrag } from 'react-dnd';

import Icon from '../Icon';
import Tooltip from '../Tooltip';
import Typography from '../Typography';
import DisplaySetMessageListTooltip from '../DisplaySetMessageListTooltip';
import ThumbnailNoImage from './ThumbnailNoImage';

const ThumbnailNoImageCustom = ({
  displaySetInstanceUID,
  description,
  seriesDate,
  modality,
  modalityTooltip,
  onClick,
  onDoubleClick,
  canReject,
  onReject,
  messages,
  dragData,
  isActive,
  isHydratedForDerivedDisplaySet,
}) => {
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
        'mb-1 cursor-pointer select-none rounded outline-none hover:border-blue-300 focus:border-blue-300',
        isActive ? 'border-primary-light border-2' : 'border border-transparent'
      )}
      style={{
        padding: isActive ? '11px' : '12px',
      }}
      id={`thumbnail-${displaySetInstanceUID}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex="0"
      data-cy={`study-browser-thumbnail-no-image`}
    >
      <div ref={drag}>
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Tooltip
              position="left"
              content={<Typography>{modalityTooltip}</Typography>}
            >
              <div
                className={classnames(
                  'truncate rounded-sm text-center text-sm',
                  isHydratedForDerivedDisplaySet
                    ? 'bg-primary-light text-black'
                    : 'bg-primary-main text-white'
                )}
              >
                {modality}
              </div>
            </Tooltip>
            <span className="text-sm text-blue-300">{seriesDate}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="truncate break-all text-sm text-white">{description}</div>
            <div className="flex gap-2">
              <DisplaySetMessageListTooltip
                position="left"
                messages={messages}
                id={`display-set-tooltip-${displaySetInstanceUID}`}
              />
              {canReject && (
                <Icon
                  name="old-trash"
                  style={{ minWidth: '12px' }}
                  className="mr-4 w-3 text-red-500"
                  onClick={onReject}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ThumbnailNoImageCustom.propTypes = ThumbnailNoImage.propTypes;

export default ThumbnailNoImageCustom;

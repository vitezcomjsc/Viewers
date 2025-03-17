import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, IconButton, LayoutSelector, Tooltip } from '@ohif/ui';
import { ServicesManager, CommandsManager } from '@ohif/core';
import { defaultCommonPresets } from '../Toolbar/ToolbarLayoutSelector';

const MAX_LAYOUT_ROWS = 5;
const MAX_LAYOUT_COLUMNS = 6;

export default function PanelLayoutSettings({
  servicesManager,
  commandsManager,
}): React.FunctionComponent {
  const [isDisabledTooltip, setIsDisabledTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => setIsDisabledTooltip(false), []);

  const { customizationService } = servicesManager.services;
  const presets = customizationService.get('commonPresets') || defaultCommonPresets;

  const onSelection = useCallback(props => {
    setIsDisabledTooltip(true);
    commandsManager.run({
      commandName: 'setViewportGridLayout',
      commandOptions: { ...props },
    });
  }, []);

  return (
    <div className="flex flex-wrap justify-between p-2 text-white">
      {presets.map(preset => (
        <IconButton
          key={preset.icon}
          size="toolbar"
          className="hover:bg-primary-dark"
          onClick={() => onSelection(preset.commandOptions)}
        >
          <Icon name={preset.icon} />
        </IconButton>
      ))}

      <div onMouseEnter={handleMouseEnter}>
        <Tooltip
          position="right"
          showHideDelay={50}
          isDisabled={isDisabledTooltip}
          content={
            <LayoutSelector
              onSelection={onSelection}
              rows={MAX_LAYOUT_ROWS}
              columns={MAX_LAYOUT_COLUMNS}
            />
          }
        >
          <IconButton
            size="toolbar"
            className="hover:bg-primary-dark"
          >
            <Icon name="layout-common-2x3" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

PanelLayoutSettings.propTypes = {
  commandsManager: PropTypes.instanceOf(CommandsManager).isRequired,
  servicesManager: PropTypes.instanceOf(ServicesManager).isRequired,
};

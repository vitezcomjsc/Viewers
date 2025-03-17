import React from 'react';
import PropTypes from 'prop-types';
import { CommandsManager, ServicesManager, useToolbar } from '@ohif/core';

export default function PanelTools({ buttonSection, servicesManager }): React.FunctionComponent {
  const { toolbarButtons, onInteraction } = useToolbar({ servicesManager, buttonSection });

  return (
    <div className="space-y-2 p-2 text-white">
      <div className="grid grid-cols-4">
        {toolbarButtons.map(toolDef => {
          if (!toolDef) {
            return null;
          }

          const { id, Component, componentProps } = toolDef;
          const tool = (
            <Component
              key={id}
              id={id}
              toolTipPosition="right"
              onInteraction={onInteraction}
              servicesManager={servicesManager}
              {...componentProps}
            />
          );

          return <div key={id}>{tool}</div>;
        })}
      </div>
    </div>
  );
}

PanelTools.propTypes = {
  buttonSection: PropTypes.string.isRequired,
  commandsManager: PropTypes.instanceOf(CommandsManager).isRequired,
  servicesManager: PropTypes.instanceOf(ServicesManager).isRequired,
};

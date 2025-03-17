import React from 'react';
import {
  WrappedPanelStudyBrowser,
  PanelMeasurementTable,
  PanelTools,
  PanelLayoutSettings,
} from './Panels';
import i18n from 'i18next';
import { PanelSection } from '@ohif/ui';

// TODO:
// - No loading UI exists yet
// - cancel promises when component is destroyed
// - show errors in UI for thumbnails if promise fails

function getPanelModule({ commandsManager, extensionManager, servicesManager }) {
  const wrappedMeasurementPanel = () => {
    return (
      <PanelMeasurementTable
        commandsManager={commandsManager}
        servicesManager={servicesManager}
        extensionManager={extensionManager}
      />
    );
  };

  const preferencesPanel = () => {
    return (
      <>
        <div>
          <PanelSection title="Series Layout">
            <PanelLayoutSettings
              commandsManager={commandsManager}
              servicesManager={servicesManager}
            />
          </PanelSection>
        </div>
        <div>
          <PanelSection title="Image Tools">
            <PanelTools
              buttonSection="sidebar-image-tools"
              commandsManager={commandsManager}
              servicesManager={servicesManager}
            />
          </PanelSection>
        </div>
        <div>
          <PanelSection title="Tools">
            <PanelTools
              buttonSection="sidebar-other-tools"
              commandsManager={commandsManager}
              servicesManager={servicesManager}
            />
          </PanelSection>
        </div>
        <div>
          <PanelSection title="Information">
            <PanelTools
              buttonSection="sidebar-info-tools"
              commandsManager={commandsManager}
              servicesManager={servicesManager}
            />
          </PanelSection>
        </div>
      </>
    );
  };

  return [
    {
      name: 'seriesList',
      iconName: 'tab-studies',
      iconLabel: 'Studies',
      label: i18n.t('SidePanel:Studies'),
      component: WrappedPanelStudyBrowser.bind(null, {
        commandsManager,
        extensionManager,
        servicesManager,
      }),
    },
    {
      name: 'measure',
      iconName: 'tab-linear',
      iconLabel: 'Measure',
      label: i18n.t('SidePanel:Measurements'),
      secondaryLabel: i18n.t('SidePanel:Measurements'),
      component: wrappedMeasurementPanel,
    },
    {
      name: 'preferences',
      iconName: 'icon-settings',
      iconLabel: 'Preferences',
      label: 'Preferences',
      secondaryLabel: 'Preferences',
      component: preferencesPanel,
    },
  ];
}

export default getPanelModule;

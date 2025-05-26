window.config = {
  routerBasename: '/',

  modes: ['@ohif/mode-longitudinal'],
  extensions: [],

  // [CAUTION]: This will degrade the performance of the application.
  // Only disable this option for debugging/ urgent purposes.
  useSharedArrayBuffer: true,

  showLoadingIndicator: true,
  showCPUFallbackMessage: true,
  showWarningMessageForCrossOrigin: true,

  // We acknowledged of investigational use dialog already
  investigationalUseDialog: { option: 'never' },

  // Hide studies list view
  showStudyList: false,

  // Some of Windows systems have issues with more than 3 web workers
  maxNumberOfWebWorkers: 3,

  // Only allow specifying study via JSON
  defaultDataSourceName: 'dicomjson',
  dataSources: [
    {
      sourceName: 'dicomjson',
      namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
      configuration: { name: 'dicomjson', friendlyName: 'dicomweb read json' },
    },
  ],
};

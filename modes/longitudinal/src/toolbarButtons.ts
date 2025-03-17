// TODO: torn, can either bake this here; or have to create a whole new button type
// Only ways that you can pass in a custom React component for render :l
import { ToolbarService, ViewportGridService } from '@ohif/core';
import type { Button, RunCommand } from '@ohif/core/types';
import { EVENTS } from '@cornerstonejs/core';

const { createButton } = ToolbarService;

export const setToolActiveToolbar = {
  commandName: 'setToolActiveToolbar',
  commandOptions: {
    toolGroupIds: ['default', 'mpr', 'SRToolGroup', 'volume3d'],
  },
};

const ReferenceLinesListeners: RunCommand = [
  {
    commandName: 'setSourceViewportForReferenceLinesTool',
    context: 'CORNERSTONE',
  },
];

const toolbarButtons: Button[] = [
  {
    id: 'EndLayoutTools',
    uiType: 'ohif.divider',
  },
  {
    id: 'EndMoveTools',
    uiType: 'ohif.divider',
  },
  {
    id: 'EndMeasurementTools',
    uiType: 'ohif.divider',
  },
  {
    id: 'EndTransformTools',
    uiType: 'ohif.divider',
  },
  {
    id: 'Layout',
    uiType: 'ohif.layoutSelector',
    props: {
      rows: 3,
      columns: 4,
      evaluate: 'evaluate.action',
      commands: 'setViewportGridLayout',
    },
  },
  {
    id: 'Zoom',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-zoom',
      label: 'Zoom',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'WindowLevel',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-window-level',
      label: 'Window Level',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Pan',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-move',
      label: 'Pan',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Magnify',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-magnify',
      label: 'Zoom-in',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'StackScroll',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-stack-scroll',
      label: 'Stack Scroll',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'TrackballRotate',
    uiType: 'ohif.radioGroup',
    props: {
      type: 'tool',
      icon: 'tool-3d-rotate',
      label: '3D Rotate',
      commands: setToolActiveToolbar,
      evaluate: {
        name: 'evaluate.cornerstoneTool',
        disabledText: 'Select a 3D viewport to enable this tool',
      },
    },
  },
  {
    id: 'Crosshairs',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-crosshair',
      label: 'Crosshairs',
      commands: {
        commandName: 'setToolActiveToolbar',
        commandOptions: {
          toolGroupIds: ['mpr'],
        },
      },
      evaluate: {
        name: 'evaluate.cornerstoneTool',
        disabledText: 'Select an MPR viewport to enable this tool',
      },
    },
  },
  {
    id: 'Invert',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-invert',
      label: 'Invert',
      commands: 'invertViewport',
      evaluate: 'evaluate.viewportProperties.toggle',
    },
  },
  {
    id: 'Reset',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-reset',
      label: 'Reset',
      commands: 'resetViewport',
      evaluate: 'evaluate.action',
    },
  },
  {
    id: 'Length',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-length',
      label: 'Length',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Probe',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-probe',
      label: 'Probe',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'EllipticalROI',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-ellipse',
      label: 'Ellipse',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'RectangleROI',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-rectangle',
      label: 'Rectangle',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'ArrowAnnotate',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-annotate',
      label: 'Annotation',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'OtherMeasurementTools',
    uiType: 'ohif.splitButton',
    props: {
      groupId: 'OtherMeasurementTools',
      evaluate: 'evaluate.group.promoteToPrimaryIfCornerstoneToolNotActiveInTheList',
      primary: createButton({
        id: 'Angle',
        icon: 'tool-angle',
        label: 'Angle',
        tooltip: 'Angle',
        commands: setToolActiveToolbar,
        evaluate: 'evaluate.cornerstoneTool',
      }),
      secondary: {
        icon: 'chevron-down',
        label: 'More Measurement Tools',
        tooltip: 'More Measurement Tools',
      },
      items: [
        createButton({
          id: 'Angle',
          icon: 'tool-angle',
          label: 'Angle',
          tooltip: 'Angle',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'Bidirectional',
          icon: 'tool-bidirectional',
          label: 'Bidirectional',
          tooltip: 'Bidirectional Tool',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'AdvancedMagnify',
          icon: 'icon-tool-loupe',
          label: 'Magnify Probe',
          tooltip: 'Magnify Probe',
          commands: 'toggleActiveDisabledToolbar',
          evaluate: 'evaluate.cornerstoneTool.toggle.ifStrictlyDisabled',
        }),
        createButton({
          id: 'CircleROI',
          icon: 'tool-circle',
          label: 'Circle',
          tooltip: 'Circle Tool',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'PlanarFreehandROI',
          icon: 'icon-tool-freehand-roi',
          label: 'Freehand ROI',
          tooltip: 'Freehand ROI',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'SplineROI',
          icon: 'icon-tool-spline-roi',
          label: 'Spline ROI',
          tooltip: 'Spline ROI',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'LivewireContour',
          icon: 'icon-tool-livewire',
          label: 'Livewire tool',
          tooltip: 'Livewire tool',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
      ],
    },
  },
  {
    id: 'ClearMeasurements',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-clear-measurements',
      label: 'Clear Measurements',
      commands: 'clearMeasurements',
    },
  },
  {
    id: 'RotateRight',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-rotate-right',
      label: 'Rotate Right',
      commands: 'rotateViewportCW',
      evaluate: 'evaluate.action',
    },
  },
  {
    id: 'RotateLeft',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-rotate-left',
      label: 'Rotate Left',
      commands: 'rotateViewportCCW',
      evaluate: 'evaluate.action',
    },
  },
  {
    id: 'FlipHorizontal',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-flip-horizontal',
      label: 'Flip Horizontal',
      commands: 'flipViewportHorizontal',
      evaluate: ['evaluate.viewportProperties.toggle', 'evaluate.not3D'],
    },
  },
  {
    id: 'FlipVertical',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-flip-vertical',
      label: 'Flip Vertical',
      commands: 'flipViewportVertical',
      evaluate: ['evaluate.viewportProperties.toggle', 'evaluate.not3D'],
    },
  },
  {
    id: 'Cine',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-cine',
      label: 'Cine',
      commands: 'toggleCine',
      evaluate: ['evaluate.cine', 'evaluate.not3D'],
    },
  },
  {
    id: 'Capture',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-capture',
      label: 'Capture',
      commands: 'showDownloadViewportModal',
      evaluate: 'evaluate.action',
    },
  },
  {
    id: 'InfoTools',
    uiType: 'ohif.splitButton',
    props: {
      groupId: 'InfoTools',
      primary: createButton({
        id: 'TagBrowser',
        icon: 'dicom-tag-browser',
        label: 'Dicom Tag Browser',
        tooltip: 'Dicom Tag Browser',
        commands: 'openDICOMTagViewer',
      }),
      secondary: {
        icon: 'chevron-down',
        label: '',
        tooltip: 'More Info Tools',
      },
      items: [
        createButton({
          id: 'TagBrowser',
          icon: 'dicom-tag-browser',
          label: 'Dicom Tag Browser',
          tooltip: 'Dicom Tag Browser',
          commands: 'openDICOMTagViewer',
        }),
        createButton({
          id: 'PatientInfo',
          icon: 'tool-patient-info',
          label: 'Patient Info',
          tooltip: 'Show Patient Info',
          commands: 'toggleIsShownPatientInfo',
          evaluate: 'evaluate.visbilityPreferences.toggleIsShownPatientInfo',
        }),
        createButton({
          id: 'AnonyInfo',
          icon: 'tool-patient-info-anony',
          label: 'Anony Info',
          tooltip: 'Anonymize Patient Info',
          commands: 'toggleIsShouldAnonymizePatientInfo',
          evaluate: 'evaluate.visbilityPreferences.toggleIsShouldAnonymizePatientInfo',
        }),
      ],
    },
  },
  {
    id: 'MoreTools',
    uiType: 'ohif.splitButton',
    props: {
      groupId: 'MoreTools',
      evaluate: 'evaluate.group.promoteToPrimaryIfCornerstoneToolNotActiveInTheList',
      primary: createButton({
        id: 'Magnify',
        icon: 'tool-magnify',
        label: 'Zoom-in',
        tooltip: 'Zoom-in',
        commands: setToolActiveToolbar,
        evaluate: 'evaluate.cornerstoneTool',
      }),
      secondary: {
        icon: 'chevron-down',
        label: '',
        tooltip: 'More Tools',
      },
      items: [
        createButton({
          id: 'Magnify',
          icon: 'tool-magnify',
          label: 'Zoom-in',
          tooltip: 'Zoom-in',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'ImageSliceSync',
          icon: 'link',
          label: 'Image Slice Sync',
          tooltip: 'Enable position synchronization on stack viewports',
          commands: {
            commandName: 'toggleSynchronizer',
            commandOptions: {
              type: 'imageSlice',
            },
          },
          listeners: {
            [EVENTS.STACK_VIEWPORT_NEW_STACK]: {
              commandName: 'toggleImageSliceSync',
              commandOptions: { toggledState: true },
            },
          },
          evaluate: ['evaluate.cornerstone.synchronizer', 'evaluate.not3D'],
        }),
        createButton({
          id: 'ReferenceLines',
          icon: 'tool-referenceLines',
          label: 'Reference Lines',
          tooltip: 'Show Reference Lines',
          commands: 'toggleEnabledDisabledToolbar',
          listeners: {
            [ViewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED]: ReferenceLinesListeners,
            [ViewportGridService.EVENTS.VIEWPORTS_READY]: ReferenceLinesListeners,
          },
          evaluate: 'evaluate.cornerstoneTool.toggle',
        }),
        createButton({
          id: 'ImageOverlayViewer',
          icon: 'toggle-dicom-overlay',
          label: 'Image Overlay',
          tooltip: 'Toggle Image Overlay',
          commands: 'toggleEnabledDisabledToolbar',
          evaluate: 'evaluate.cornerstoneTool.toggle',
        }),
        createButton({
          id: 'UltrasoundDirectionalTool',
          icon: 'icon-tool-ultrasound-bidirectional',
          label: 'Ultrasound Directional',
          tooltip: 'Ultrasound Directional',
          commands: setToolActiveToolbar,
          evaluate: ['evaluate.cornerstoneTool', 'evaluate.isUS'],
        }),
      ],
    },
  },
];

export default toolbarButtons;

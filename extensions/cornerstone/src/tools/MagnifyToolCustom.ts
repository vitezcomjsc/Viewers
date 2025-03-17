import { MagnifyTool } from '@cornerstonejs/tools';

class CustomMagnifyTool extends MagnifyTool {
  constructor(
    toolProps = {},
    defaultToolProps = {
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        magnifySize: 7, // Set the magnifySize to 0.1
        magnifyWidth: 200, // px
        magnifyHeight: 200, // px
      },
    }
  ) {
    super(toolProps, defaultToolProps);
  }

  // You can add additional methods or override existing ones if needed
}

export default CustomMagnifyTool;

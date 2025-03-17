import {
  Button,
  ButtonProps,
  NestedButtonProps,
} from 'platform/core/src/services/ToolBarService/types';

interface SplitButton extends Button {
  uiType: 'ohif.splitButton';
  props: NestedButtonProps;
}

export function expandSplitButton(splitButton: SplitButton): Button[] {
  return splitButton.props.items.map(button => ({
    id: `${splitButton.id}-${button.id}`,
    uiType: 'ohif.radioGroup',
    props: {
      id: button.id,
      type: 'tool',
      icon: button.icon,
      label: button.label,
      tooltip: button.tooltip,
      commands: button.commands,
      evaluate: button.evaluate,
      listeners: button.listeners,
    } as ButtonProps,
  }));
}

export function expandAllSplitButtons(buttons: Button[]): Button[] {
  function expandIfSplitButton(button: Button) {
    return button.uiType === 'ohif.splitButton'
      ? expandSplitButton(button! as SplitButton)
      : button;
  }

  return buttons.map(expandIfSplitButton).flat();
}

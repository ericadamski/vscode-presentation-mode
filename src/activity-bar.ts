import { commands, WorkspaceConfiguration } from 'vscode';

export default function activityBar(c: WorkspaceConfiguration) {
  return {
    toggle() {
      c.get('workbench.activityBar.visible') &&
        commands.executeCommand('workbench.action.toggleActivityBarVisibility');
    },
  };
}

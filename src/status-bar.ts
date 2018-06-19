import { commands, WorkspaceConfiguration } from 'vscode';

export default function statusBar(c: WorkspaceConfiguration) {
  return {
    toggle() {
      c.get('workbench.statusBar.visible') &&
        commands.executeCommand('workbench.action.toggleStatusbarVisibility');
    },
  };
}

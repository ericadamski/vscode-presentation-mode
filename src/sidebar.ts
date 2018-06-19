import { commands, WorkspaceConfiguration } from 'vscode';

export default function sidebar(c?: WorkspaceConfiguration) {
  return {
    toggle() {
      commands.executeCommand('workbench.action.toggleSidebarVisibility');
    },
  };
}

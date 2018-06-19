import { commands, WorkspaceConfiguration } from 'vscode';

export default function minimap(c: WorkspaceConfiguration) {
  return {
    toggle() {
      c.get('editor.minimap.enabled') &&
        commands.executeCommand('editor.action.toggleMinimap');
    },
  };
}

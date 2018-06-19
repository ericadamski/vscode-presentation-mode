import { workspace, WorkspaceConfiguration } from 'vscode';

export default function(c: WorkspaceConfiguration) {
  return {
    start() {
      workspace
        .getConfiguration('workbench', null)
        .update(
          'colorTheme',
          workspace
            .getConfiguration('presentationMode', null)
            .get('colorTheme'),
          false
        );
    },
    stop() {
      workspace
        .getConfiguration('workbench', null)
        .update('colorTheme', c.get('workbench.colorTheme'));
    },
  };
}

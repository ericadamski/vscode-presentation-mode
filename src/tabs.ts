import { WorkspaceConfiguration } from 'vscode';

export default function tabs(c: WorkspaceConfiguration) {
  return {
    toggle() {
      c.inspect('workbench.editor.showTabs').globalValue &&
        c.update(
          'workbench.editor.showTabs',
          !c.inspect('workbench.editor.showTabs').globalValue
        );
    },
  };
}

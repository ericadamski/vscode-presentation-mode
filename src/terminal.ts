import { workspace, WorkspaceConfiguration } from 'vscode';

const term = 'terminal.integrated';
const terminal = workspace.getConfiguration(term, null);
const settings = workspace.getConfiguration('presentationMode.terminal');

export default function(c: WorkspaceConfiguration) {
  return {
    start() {
      terminal.update('fontFamily', settings.get('fontFamily'), false);
      terminal.update('fontWeight', settings.get('fontWeight'), false);
      terminal.update('fontSize', settings.get('fontSize'), false);
    },
    stop() {
      terminal.update(
        'fontFamily',
        c.inspect(`${term}.fontFamily`).globalValue
      );
      terminal.update(
        'fontWeight',
        c.inspect(`${term}.fontWeight`).globalValue
      );
      terminal.update('fontSize', c.inspect(`${term}.fontSize`).globalValue);
    },
  };
}

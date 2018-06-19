import { workspace, WorkspaceConfiguration } from 'vscode';

const editor = workspace.getConfiguration('editor', null);
const settings = workspace.getConfiguration('presentationMode.editor');

export default function terminal(c: WorkspaceConfiguration) {
  return {
    start() {
      editor.update('fontFamily', settings.get('fontFamily'), false);
      editor.update('fontSize', settings.get('fontSize'), false);
      editor.update('fontWeight', settings.get('fontWeight'), false);
      editor.update('formatOnSave', false, false);
    },

    stop() {
      editor.update('fontFamily', c.get('editor.fontFamily'), false);
      editor.update('fontSize', c.get('editor.fontSize'), false);
      editor.update('fontWeight', c.get('editor.fontWeight'), false);
      editor.update('formatOnSave', c.get('editor.formatOnSave'), false);
    },
  };
}

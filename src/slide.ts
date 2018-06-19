import { TextEditor, window, workspace } from 'vscode';

export default class Slide {
  fileName: string;
  name: string;
  index: number;

  constructor({ path, name, number }) {
    this.fileName = path;
    const fsplit = name.split('.');
    fsplit.length > 1 && fsplit.splice(-1, 1);

    this.name = fsplit.join('.');
    this.index = number;
  }

  open(): Thenable<TextEditor> {
    return workspace
      .openTextDocument(this.fileName)
      .then(file => window.showTextDocument(file));
  }
}

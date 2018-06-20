import { commands, Uri } from 'vscode';

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

  open(): Thenable<any> {
    const uri = Uri.parse(`file://${this.fileName}`);

    return commands.executeCommand('vscode.open', uri);
  }
}

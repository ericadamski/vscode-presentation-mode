'use strict';
import { from, fromEventPattern, Subject } from 'rxjs';
import { filter, map, mapTo, switchAll, takeUntil, tap } from 'rxjs/operators';
import {
  CancellationToken,
  commands,
  ExtensionContext,
  Progress,
  ProgressLocation,
  TextEditor,
  window,
  workspace,
  WorkspaceConfiguration,
} from 'vscode';

const DIRECTIONS = {
  LEFT: -1,
  RIGHT: 1,
};

function toggleTabs(c: WorkspaceConfiguration): () => void {
  return () => {
    c.inspect('workbench.editor.showTabs').globalValue &&
      c.update(
        'workbench.editor.showTabs',
        !c.inspect('workbench.editor.showTabs').globalValue
      );
  };
}

function toggleActivityBar(c: WorkspaceConfiguration): () => void {
  return () =>
    c.get('workbench.activityBar.visible') &&
    commands.executeCommand('workbench.action.toggleActivityBarVisibility');
}

function toggleStatusBar(c: WorkspaceConfiguration): () => void {
  return () =>
    c.get('workbench.statusBar.visible') &&
    commands.executeCommand('workbench.action.toggleStatusbarVisibility');
}

function toggleMiniMap(c: WorkspaceConfiguration): () => void {
  return () =>
    c.get('editor.minimap.enabled') &&
    commands.executeCommand('editor.action.toggleMinimap');
}

const ogConfig = workspace.getConfiguration('', null);

const toggleSettings = [
  toggleMiniMap(ogConfig),
  toggleTabs(ogConfig),
  toggleActivityBar(ogConfig),
  toggleStatusBar(ogConfig),
  () => commands.executeCommand('workbench.action.toggleSidebarVisibility'),
];

class Slide {
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

class Presentation {
  static slides: { [key: number]: Slide } = {};
  static order: Array<string>;
  static started: boolean = false;
  static index: number = 0;
  static presentation$ = null;

  static initialize(cb) {
    return new Promise(resolve =>
      from(workspace.findFiles('*.*'))
        .pipe(
          switchAll(),
          map(uri => {
            const p = uri.toJSON().fsPath.split('/');

            return {
              path: uri.toJSON().fsPath,
              name: p[Math.max(0, p.length - 1)],
            };
          }),
          tap(console.log),
          filter(({ name }) => name.charAt(0) !== '.'),
          filter(({ name }) => !isNaN(+name.charAt(0))),
          map(({ name, path }) => ({ name, path, number: +name.charAt(0) }))
        )
        .subscribe({
          next: slide => (this.slides[slide.number] = new Slide(slide)),
          complete: () => {
            this.order = Object.keys(this.slides).sort();
            this.started = true;
            cb();
            resolve();
          },
        })
    );
  }

  static next(): void {
    if (++this.index <= Object.keys(this.slides).length - 1)
      return this.presentation$.next({
        index: this.index,
        direction: DIRECTIONS.RIGHT,
      });

    return this.presentation$.complete();
  }

  static previous(): void {
    this.presentation$.next({
      index: (this.index = Math.max(0, this.index - 1)),
      direction: DIRECTIONS.LEFT,
    });
  }

  static present(
    progress: Progress<{ increment: number; message: string }>,
    cancelToken: CancellationToken
  ): Thenable<void> {
    const length = Object.keys(this.slides).length;
    this.slides[this.order[0]].open();

    return (this.presentation$ || (this.presentation$ = new Subject()))
      .pipe(
        tap(
          ({ index, direction }): void => {
            progress.report({
              increment: direction * ((index + 1) * (100 / length)),
              message: `${index + 1}/${length}`,
            });

            this.slides[this.order[index]].open();
          }
        ),
        mapTo(undefined),
        takeUntil(fromEventPattern(cancelToken.onCancellationRequested))
      )
      .toPromise()
      .then(() => {
        this.presentation$.unsubscribe();
        deactivate();
      });
  }
}

// attach some key commands that ship with this package, maybe only enable them when it is running?

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('presentation.start', async () => {
      await Presentation.initialize(() => {
        const editor = workspace.getConfiguration('editor', null);

        editor.update(
          'fontFamily',
          editor.inspect('fontFamily').defaultValue,
          false
        );
        editor.update('fontSize', 16, false);
        workspace
          .getConfiguration('workbench', null)
          .update('colorTheme', 'Default Light+', false);

        toggleSettings.map(fn => fn());

        context.subscriptions.push(
          commands.registerCommand('presentation.stop', () => {
            window.showInformationMessage('Stopping Presenting!');
            deactivate();
          })
        );
      });

      context.subscriptions.push(
        commands.registerCommand('presentation.next', () => {
          if (!(Presentation && Presentation.started))
            return window.showInformationMessage(
              'Please start a presentation to navigate.'
            );

          Presentation.next();
        })
      );

      context.subscriptions.push(
        commands.registerCommand('presentation.previous', () => {
          if (!(Presentation && Presentation.started))
            return window.showInformationMessage(
              'Please start a presentation to navigate.'
            );

          Presentation.previous();
        })
      );

      window.withProgress(
        {
          title: 'Presenting',
          location: ProgressLocation.Notification,
          cancellable: true,
        },
        Presentation.present.bind(Presentation)
      );
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  const editor = workspace.getConfiguration('editor', null);
  editor.update('fontFamily', ogConfig.get('editor.fontFamily'), false);
  editor.update('fontSize', ogConfig.get('editor.fontSize'), false);
  workspace
    .getConfiguration('workbench', null)
    .update('colorTheme', ogConfig.get('workbench.colorTheme'));
  toggleSettings.map(fn => fn());
}

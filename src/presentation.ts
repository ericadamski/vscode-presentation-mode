import { readdir } from 'fs';
import { basename, join } from 'path';
import { bindNodeCallback, fromEventPattern, Subject } from 'rxjs';
import { filter, map, mapTo, switchAll, takeUntil, tap } from 'rxjs/operators';
import { CancellationToken, Progress, Uri, window, workspace } from 'vscode';
import activityBar from './activity-bar';
import editor from './editor';
import minimap from './minimap';
import sidebar from './sidebar';
import Slide from './slide';
import statusBar from './status-bar';
import tabs from './tabs';
import terminal from './terminal';
import ws from './workspace';

const readDir = bindNodeCallback(readdir);

const ogConfig = workspace.getConfiguration('', null);
const toggles = [activityBar, minimap, sidebar, statusBar, tabs].map(fn =>
  fn(ogConfig)
);
const startStop = [editor, terminal, ws].map(fn => fn(ogConfig));

const DIRECTIONS = { LEFT: -1, RIGHT: 1 };

export default class Presentation {
  static slides: { [key: number]: Slide } = {};
  static order: Array<string>;
  static presentationLength: number;
  static index: number = 0;
  static presentation$ = null;
  private static started: boolean = false;

  private static isPresenting() {
    if (!this.started)
      return (
        window.showInformationMessage('A presentation has not been started.'),
        false
      );

    return true;
  }

  static deactivate() {
    toggles.forEach(({ toggle }) => toggle());
    startStop.forEach(({ stop }) => stop());
  }

  static initialize(): Promise<void> {
    return new Promise(resolve =>
      readDir(workspace.rootPath)
        .pipe(
          switchAll(),
          map((p: string) => Uri.parse(join(workspace.rootPath, p))),
          map(uri => {
            const name = basename(uri.toJSON().fsPath).split('.');

            return {
              path: uri.toJSON().fsPath,
              ext: name.pop(),
              name: name.join('.'),
            };
          }),
          filter(({ name }) => name !== '' && !isNaN(+name)),
          map(({ name, path }) => ({ name, path, number: +name }))
        )
        .subscribe({
          next: slide => (this.slides[slide.number] = new Slide(slide)),
          complete: () => {
            this.order = Object.keys(this.slides).sort((a, b) => {
              const x = +a;
              const y = +b;

              if (x > y) return 1;
              if (x < y) return -1;

              return 0;
            });

            this.presentationLength = this.order.length;
            resolve();
          },
        })
    );
  }

  static next(): void {
    if (this.isPresenting()) {
      if (this.index + 1 <= this.presentationLength - 1)
        return this.presentation$.next({
          index: this.index + 1,
          direction: DIRECTIONS.RIGHT,
        });

      return this.presentation$.complete();
    }
  }

  static previous(): void {
    this.isPresenting() &&
      this.presentation$.next({
        index: Math.max(0, this.index - 1),
        direction: DIRECTIONS.LEFT,
      });
  }

  static present(
    progress: Progress<{ increment: number; message: string }>,
    cancelToken: CancellationToken
  ): Thenable<void> {
    this.started = true;
    toggles.forEach(({ toggle }) => toggle());
    startStop.forEach(({ start }) => start());
    this.slides[this.order[0]].open();

    return (this.presentation$ || (this.presentation$ = new Subject()))
      .pipe(
        filter(({ index }) => index !== this.index),
        tap(
          ({ index, direction }): void => {
            this.index = index;

            progress.report({
              increment:
                direction * ((index + 1) * (100 / this.presentationLength)),
              message: `${index + 1}/${this.presentationLength}`,
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
        this.deactivate();
      });
  }
}

import { from, fromEventPattern, Subject } from 'rxjs';
import { filter, map, mapTo, switchAll, takeUntil, tap } from 'rxjs/operators';
import { CancellationToken, Progress, window, workspace } from 'vscode';
import activityBar from './activity-bar';
import editor from './editor';
import minimap from './minimap';
import sidebar from './sidebar';
import Slide from './slide';
import statusBar from './status-bar';
import tabs from './tabs';
import terminal from './terminal';
import ws from './workspace';

const ogConfig = workspace.getConfiguration('', null);
const toggles = [activityBar, minimap, sidebar, statusBar, tabs].map(fn =>
  fn(ogConfig)
);
const startStop = [editor, terminal, ws].map(fn => fn(ogConfig));

const DIRECTIONS = { LEFT: -1, RIGHT: 1 };

export default class Presentation {
  static slides: { [key: number]: Slide } = {};
  static order: Array<string>;
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

  static initialize() {
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
          filter(({ name }) => name.charAt(0) !== '.'),
          filter(({ name }) => !isNaN(+name.charAt(0))),
          map(({ name, path }) => ({ name, path, number: +name.charAt(0) }))
        )
        .subscribe({
          next: slide => (this.slides[slide.number] = new Slide(slide)),
          complete: () => {
            this.order = Object.keys(this.slides).sort();
            resolve();
          },
        })
    );
  }

  static next(): void {
    if (this.isPresenting()) {
      if (this.index + 1 <= Object.keys(this.slides).length - 1)
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
    const length = Object.keys(this.slides).length;
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
              increment: direction * ((index + 1) * (100 / length)),
              message: `${index + 1}/${length}`,
            });

            console.log(workspace.textDocuments);

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

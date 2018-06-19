'use strict';

import { commands, ExtensionContext, ProgressLocation, window } from 'vscode';
import Presentation from './presentation';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('presentation.start', async () => {
      await Presentation.initialize();

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

  context.subscriptions.push(
    commands.registerCommand(
      'presentation.next',
      Presentation.next.bind(Presentation)
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      'presentation.previous',
      Presentation.previous.bind(Presentation)
    )
  );

  context.subscriptions.push(
    commands.registerCommand('presentation.stop', deactivate)
  );
}

export function deactivate() {
  Presentation.deactivate();
}

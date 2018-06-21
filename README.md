# Presentation Mode

Inspired by [this](https://staltz.com/your-ide-as-a-presentation-tool.html) post by André Staltz, here is a vscode extension that allows you to treat your editor more like a presentation tool.

![presentation-mode](https://user-images.githubusercontent.com/6516758/41659016-25da1c74-7466-11e8-99da-bec485d954c4.gif)

## Usage

This extension looks for files that start with numbers to that it can determine an order to your presentation. For example, here is a presentation with 3 slides:

```
presentation
├── 1-hello.md
├── 2-me.png
└── 3-thank-you.js
```

1.  To start a presentation type `present` into the command palette (`⌘+SHIFT+P`). **This will take a little while to load as it searches your open project for fiels matching the above pattern and orders the slides** 😢
2.  Once everything is loaded you can navigate the next and previous slides with `CTRL+SHIFT+⌘` and the arrow key for the direction you which to go.

**Note:** If you go past the end of the slides the presentation mode is automatically ended. You can manually canel the presentation by running the `End Presentation` command or clicking cancel on the progress notification.

## Extension Settings

- `presentationMode.colorTheme`: The color theme to use when presenting

### Editor Settings

- `presentationMode.editor.fontSize`: The size of the editor font when presenting
- `presentationMode.editor.fontWeight`: The weight of the editor font when presenting
- `presentationMode.editor.fontFamily`: The family of the font for the editor when presenting

### Terminal Settings

- `presentationMode.terminal.fontSize`: The size of the terminal font when presenting
- `presentationMode.terminal.fontWeight`: The weight of the terminal font when presenting
- `presentationMode.terminal.fontFamily`: The family of the font for the terminal when presenting

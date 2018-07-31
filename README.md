# Presentation Mode

Inspired by [this](https://staltz.com/your-ide-as-a-presentation-tool.html) post by André Staltz, here is a vscode extension that allows you to treat your editor more like a presentation tool.

![presentation](https://user-images.githubusercontent.com/6516758/43458632-eb35c110-9498-11e8-8d70-c699a7fd76e6.gif)

## Usage

This extension looks for files that start with numbers to that it can determine an order to your presentation. For example, here is a presentation with 3 slides:

```
presentation
├── 1.md
├── 2.png
└── 3.js
```

1.  To start a presentation type `present` into the command palette (`⌘+SHIFT+P`). **This will take a little while to load as it searches your open project for files matching the above pattern and orders the slides** 😢
2.  Once everything is loaded you can navigate the next and previous slides with `CTRL+SHIFT+⌘` and the arrow key for the direction you which to go.

**Note:** If you go past the end of the slides the presentation mode is automatically ended. You can manually canel the presentation by running the `End Presentation` command or clicking cancel on the progress notification.

## Adding a slide

![add-slide](https://user-images.githubusercontent.com/6516758/43458225-6b139fe4-9497-11e8-994c-43fea635edf9.gif)

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

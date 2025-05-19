# JSON Log Formatter

A lightweight VS Code extension that colour-codes line-delimited JSON logs for rapid scanning.

| Log part                                               | Default colour                     |
| ------------------------------------------------------ | ---------------------------------- |
| **Special keys** – `level / time / name / message`     | `#FF99D6` (pink)                   |
| **Other JSON keys**                                    | `#D8DEE9` (slate)                  |
| `level` values → `trace · debug · info · warn · error` | grey · green · blue · yellow · red |
| `time` value                                           | `#9CDCFE`                          |
| `name` value                                           | `#4EC9B0`                          |
| `message` value                                        | `#C586F2`                          |

> Colours apply **only** when the editor language is *JSON Log*; other file-types remain unchanged.

---

## Features

* **Semantic highlighting** – works with any theme, no regex hacks.
* Detects files ending in `.log`, `.jsonl`, `.slog` (or any glob you map).
* One-time, per-workspace colour injection – no manual settings required.
* Written in pure TypeScript; zero runtime dependencies.

---

## Installation

```bash
# build once (inside the extension folder)
npm install
npm run compile
vsce package                     # produces json-log-formatter-<version>.vsix

# install in VS Code / Cursor
code --install-extension json-log-formatter-<version>.vsix
```

Reload VS Code → open any `.log` file → enjoy the palette.

---

## Customisation

All colours are stored in **.vscode/settings.json**.
Override any shade to match your theme:

```jsonc
// .vscode/settings.json
"editor.semanticTokenColorCustomizations": {
  "rules": {
    "logKey":   "#FFC0FF",   // softer pink
    "jsonKey":  "#AAB4BE",   // darker slate
    "nameValue":"#3EC0A0"    // mint
  }
}
```

---

## Example

```json
{"level":"info","time":"2025-05-18T12:37:59Z","name":"graphql/server","message":"Building service azure_devops"}
```

Open that line in VS Code and you’ll see:

* **"level / time / name / message"** keys in pink
* Timestamp in light-blue, module name in teal, message text in violet
* `info` value in blue, `warn` in yellow, `error` in red, etc.

---

Made with ♥ for fellow Devs. Happy debugging!

# unified-text

Beautiful Markdown editor inspired by Bear. Powered by CodeMirror 6.*

> **⚠️ Work in progress – the public API is experimental and *will* change without notice.**

---

## Installation

```bash
npm i unified-text          # or pnpm add / yarn add
```

---

## Quick start

```svelte
<script lang="ts">
  import Editor from 'unified-text/Editor.svelte';
  import { bear } from 'unified-text/theme';

  let content = '# Hello world';
</script>

<Editor {content} theme={bear} on:mount={(e) => console.log('mounted', e.detail)} />
```

Imperative usage:

```ts
import { UnifiedText } from 'unified-text';
import { bear } from 'unified-text/theme';

const editor = new UnifiedText({
  e: document.getElementById('editor')!,
  theme: bear,
  content: '# Hello world',
});
```

---

## Editor options (`new UnifiedText(opts)`)


| name          | type                   | default | notes                                                                         |
| ------------- | ---------------------- | ------- | ----------------------------------------------------------------------------- |
| **`theme`**   | `ThemeOptions`         | –       | required; use pre-packaged themes `bear`, `oceanBlue`, or a custom theme from `createTheme()` |
| `content`     | `string`               | `''`    | initial Markdown                                                              |
| `completions` | `MarkdownCompletion[]` | `[]`    | extra autocomplete suggestions                                                |
| `e`           | `HTMLElement`          | –       | mount point                            |

Common instance methods:

```ts
setContent(markdown: string, id?: string)
getContent(): string
focus()
setTheme(theme: ThemeOptions)
```

---

## Theming – `createTheme()`

```ts
import createTheme from 'unified-text/theme';
import { tags as t } from '@lezer/highlight';

const myTheme = createTheme({
  settings: {
    background: '#ffffff',
    foreground: '#1f1f1f',
    selection: '#c7d2fe',
    caret: '#fb923c',
    requiredFonts: ['Inter'],
  },
  styles: [
    { node: 'ATXHeading1', fontSize: '2rem', fontWeight: 600 },
    { node: ['BulletList', 'OrderedList'], marginLeft: '1rem' },
  ],
  codeStyles: [
    { tag: t.keyword, fontWeight: 'bold' },
  ],
});
```

### Theme options

| root key     | description                                                                     |
| ------------ | ------------------------------------------------------------------------------- |
| `settings`   | editor‑level style primitives (colors, spacing, fonts, etc.)                    |
| `styles`     | per‑Markdown‑node style objects; `node` may be a single `MarkdownType` or array |
| `codeStyles` | CodeMirror `TagStyle` array for fenced‑code blocks                              |
| `icons?`     |  base64 SVGs to show in the autocomplete UI                                     |

See `src/theme/*.js` for reference implementations (`bear`, `oceanBlue`).



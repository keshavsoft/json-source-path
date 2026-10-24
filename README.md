# json-renderers-build-table

> Build a complete HTML table JSON specification from columns + data — declaratively.

---

## Why this exists

Building a `<table>` from raw data is repetitive work that quickly becomes messy:

- You scatter `createElement` calls across your codebase
- Adding a column means touching the header, the body cells, the footer, and the colgroup
- Swapping a cell style for one column (e.g. a badge instead of plain text) means rewriting imperative DOM code
- Testing is hard because the logic is entangled with the DOM

This library inverts that. **You describe what the table should look like in JSON.** The library stamps it out.

The result is a plain JSON object — a DOM specification — that you hand to a renderer like [`@keshavsoft/json-to-tag`](https://keshavsoft.github.io/json-to-tag/dist/v9/min.js). The renderer turns it into real DOM elements. The builder never touches the DOM.

---

## The core idea: declarative instructions over a shared registry

Every build runs through three layers:

```
1. Registry      holds { data, base, spec }
                   data  = your columns + rows
                   base  = the empty table skeleton (colgroup, thead, tbody, tfoot)
                   spec  = named cell/row templates

2. Instructions  a JSON array that says:
                   "read THIS source path,
                    apply THIS template,
                    write the result to THIS destination"

3. writePath     navigates the base tree by data-role anchor
                 and writes using a named action
                 (set / push / unshift / pushToRows / ...)
```

Because the instructions are JSON, you can read a build sequence without tracing any JavaScript. Each instruction has a `narration` field that explains itself in plain English.

---

## How a table gets built (v18 `simple`)

```
columns.json     batches.json
      \               /
       simple({ columns, data })
              |
              |  registry = { data, base, spec }
              |
              +-- single instructions (fromCollection)
              |     colgroup children   (one <col> per column)
              |     thead > tr children (one <th> per column)
              |
              +-- double instructions (twoDimensional)
                    tbody children      (one <tr> per row, one <td> per column)
              |
              +-- returns base (fully populated JSON tree)
```

The returned `base` is a plain JavaScript object:

```json
{
  "tagName": "table",
  "attributes": { "class": "table table-hover ..." },
  "children": [
    { "tagName": "colgroup", "children": [ "..." ] },
    { "tagName": "thead",    "children": [ { "tagName": "tr", "children": [ "..." ] } ] },
    { "tagName": "tbody",    "children": [ "..." ] },
    { "tagName": "tfoot",    "children": [ "..." ] }
  ]
}
```

Hand that to any spec-to-DOM renderer and you get a real table element.

---

## Quick start

```js
import { simple } from "./docs/dist/v18/min.js";

const columns = [
    {
        columnName: "itemName",
        width: "300px",
        template: { body: { tr: "buildBodyTr", cell: "buildBodyCell" } }
    },
    {
        columnName: "baseUnit",
        width: "200px",
        template: { body: { tr: "buildBodyTr", cell: "buildBodyCell" } }
    },
    {
        columnName: "batches",
        width: "100px",
        template: { body: { tr: "buildBodyTr", cell: "buttonCell" } }
    }
];

const data = [
    { itemName: "0.11-25", baseUnit: "kgs", batches: 1 },
    { itemName: "0.11-30", baseUnit: "kgs", batches: 0 }
];

const spec = simple({ columns, data });

// spec is a plain JSON tree — pass it to your DOM renderer
const element = window.ks.jsonToTag.buildSpecElement(spec);
document.getElementById("container").appendChild(element);
```

---

## What each column config means

| Field | Purpose |
|---|---|
| `columnName` | Maps to the data property on each row object |
| `width` | Written into the `<col>` element in the colgroup |
| `template.body.tr` | Key into `spec.json` — which `<tr>` template to use for body rows |
| `template.body.cell` | Key into `spec.json` — which `<td>` template to use for this column's cells |

You change the look of a column's cells by pointing `template.body.cell` at a different key in `spec.json`. No JavaScript changes needed.

---

## Cell templates (`spec.json`)

Pre-built templates in `src/v18/spec.json`:

| Key | Renders |
|---|---|
| `buildBodyCell` | Plain `<td>` with the row value as text |
| `buttonCell` | `<td>` containing a `<button>` showing the aggregate count |
| `buildHeader` | `<th>` with uppercase text |
| `buildColGroup` | `<col>` with a width attribute |
| `buildFooter` | `<td>` with a text `<input>` for footer rows |
| `buildOption` | `<option>` element |
| `buildSelect` | `<select>` container |
| `buildDataList` | `<datalist>` container |

---

## Why columns drive everything

A column definition is the single source of truth for **one vertical slice** of the table:

- its header cell (`buildHeader` template)
- its width (`buildColGroup` template)
- its body cell template (`template.body.cell`)
- its footer cell (if enabled)

Adding a column = adding one object to the columns array.  
Removing a column = removing it.  
The instructions loop over columns automatically.  
There is no imperative "add a th, then add a td, then add a col" sequence to maintain.

---

## Build

```bash
npm install
npm run build
# output: docs/dist/v18/min.js
```

The Vite config auto-detects the highest `vN` folder under `src/` and builds that version. No config changes needed when a new version is added.

---

## Run the sample

```bash
npx serve
# open http://localhost:PORT/samples/v18/simpleTable/
```

---

## Project structure

```
src/
  v18/
    index.js              exports { simple }
    spec.json             named cell/row templates
    simple/
      index.js            the build runner (registry + instructions)
      base.json           empty table skeleton with data-role anchors
      instructions/
        single.json       fromCollection instructions (colgroup, thead)
        double.json       twoDimensional instruction (tbody)
      writePath/
        index.js          tree writer with named actions

samples/
  v18/
    simpleTable/          live demo: columns.json + batches.json

docs/
  dist/
    v18/min.js            pre-built bundle (committed, served via GitHub Pages)
```

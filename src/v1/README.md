# writePath

> **Resolve where to write → pick how to write → write it.**

`writePath` is the write-side of the instruction runner. Given a `registry` of JSON trees, a `path` descriptor (which file, which node, which action), and a `value`, it navigates to the right spot and applies the right mutation.

---

## Folder structure

```
writePath/
├── index.js                ← orchestrator
│
├── resolveParent/
│   └── index.js            ← navigate registry + path → { parent, key }
│
├── actions/
│   ├── index.js            ← action registry (name → function)
│   ├── basic.js            ← set · push · unshift        (single-node writes)
│   └── rows.js             ← pushToRows · unshiftToRows · unshiftSerialToRows  (fan-out writes)
│
└── utils/
    └── toArray.js          ← normalise scalar/array → always an array
```

---

## The story in three acts

### Act 1 — Resolve (`resolveParent`)

The `path` descriptor tells us *where* to write:

```json
{
  "fileName": "base",
  "dataRole": "table-header-row",
  "filePath": ["children"],
  "action": "unshift"
}
```

`resolveParent` uses `fileName` to pick the right tree out of the registry, optionally uses `dataRole` to jump to a specific subtree via `findByRole`, then walks `filePath` until only the *last key* remains. It returns `{ parent, key }` — the two handles needed to perform any write.

### Act 2 — Pick (`actions/index.js`)

The `action` string on the path selects a function from the action registry. If the name is not found, `set` is used as the safe default.

| Action name | File | What it does |
|---|---|---|
| `set` | `basic.js` | `parent[key] = value` |
| `push` | `basic.js` | Appends value(s) to `parent[key]` |
| `unshift` | `basic.js` | Prepends value(s) to `parent[key]` |
| `pushToRows` | `rows.js` | Appends a **clone** of value to every row's `children` |
| `unshiftToRows` | `rows.js` | Prepends a **clone** of value to every row's `children` |
| `unshiftSerialToRows` | `rows.js` | Prepends a numbered clone (1, 2, 3 …) to every row's `children` |

> **basic vs rows** — `basic` writes to *one* node. `rows` fans out across every row, deep-cloning the value each time so rows don't share references.

### Act 3 — Write (`index.js`)

The orchestrator glues it together:

```js
const { parent, key } = resolveParent(registry, path);
const action = actions[path.action] || set;
action(parent, key, value);
```

Nothing more. Index knows no write logic itself — it only delegates.

---

## Path descriptor reference

| Field | Type | Required | Meaning |
|---|---|---|---|
| `fileName` | `string` | ✅ | Key into `registry` |
| `dataRole` | `string` | — | If present, `findByRole` jumps to this subtree first |
| `filePath` | `string[]` | ✅ | Key path to walk; last element becomes `key` |
| `action` | `string` | — | Action name; defaults to `set` |

---

## Usage in context

`writePath` is called by `runSingleInstruction` (the instruction runner) after the source value has been resolved and transformed:

```js
const source = resolvePath(registry, instruction.sourcePath);
const result = applyTemplate(source, spec[instruction.templateKey]);
writePath(registry, instruction.destinationPath, result);
```

The instruction JSON drives the whole pipeline — `writePath` is just the final step.

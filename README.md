# Tiếng Việt liền — Solid Vietnamese

A static web app that explores writing Vietnamese as solid, English-style words — joining space-separated syllables into single orthographic units and inserting an apostrophe (`'`) only where concatenation would create an unintended alternative reading.

**Live demo:** [mknguyen1202.github.io/newviet](https://mknguyen1202.github.io/newviet) *(deploy to activate)*

---

## The idea

Standard Vietnamese orthography writes every syllable as a separate token:

> *tiếng việt* · *điện thoại* · *phát hành*

This project asks: what if we joined them like English words?

> *tiếngviệt* · *điệnthoại* · *phát'hành*

The apostrophe in *phát'hành* signals an ambiguity: `pháthành` could also be read as `phá thành` ("destroy the citadel"). Without the mark, the reader cannot tell which pair was intended. Unambiguous joins get no separator at all.

---

## Features

- **Telex input** — type Vietnamese without an OS IME (e.g. `tieengs vieejt` → *tiếng việt*)
- **Greedy dictionary lookup** — groups up to 4 syllables into the longest known word before joining
- **Conservative apostrophe rule** — inserted only when an alternative valid 2-syllable split exists in the dictionary
- **Side-by-side examples** — first six lines of *Truyện Kiều* and an excerpt from the Vietnamese Wikipedia article on software bugs
- **Two-pane converter** — paste any Vietnamese text; get the joined form with a copy button and a shareable `?q=` link
- **Dark mode** — toggle in the header, persisted via `localStorage`
- **Bundled dictionary** — 835+ curated multi-syllable entries in `src/data/words.json`

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

### Regenerate the syllable set

```bash
npm run build:data   # writes src/data/syllables.json (18 564 entries)
```

This only needs re-running if you change the phonotactic rules in `scripts/build-data.ts`.

### Production build

```bash
npm run build        # output → dist/
npm run preview      # serve dist/ locally
```

### Tests

```bash
npm test             # 11 tests across telex, syllable, and joiner modules
```

---

## Extending the dictionary

Add entries to `src/data/words.json` to improve joining and ambiguity detection:

```json
{ "words": [
  ["tiếng", "việt"],
  ["điện", "thoại"],
  ["hệ", "điều", "hành"]
] }
```

Each entry is an array of syllables (2–4). The joiner uses longest-match first.

---

## License

Source code: MIT.  
Wikipedia excerpt in `WikiExample.tsx`: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — *Lỗi phần mềm*, vi.wikipedia.org.

# @whyliam/hexo-reference

Markdown footnotes with accessible references, desktop hover previews and local CSS. Maintained fork of `hexo-reference`.

## Install

Node.js **20.19+**, Hexo 7/8. Prefer a supported LTS Node.js version in production.

```sh
npm uninstall hexo-reference
npm install @whyliam/hexo-reference
npx hexo clean
npx hexo generate
```

Scoped Hexo plugins are discovered automatically. If migrating an existing alias install, either keep `hexo-reference@npm:@whyliam/hexo-reference` or remove that dependency before installing the scoped name. Do not load both. No theme changes or third-party CSS CDN are required.

## Syntax

```markdown
A numbered reference[^5], a named reference[^source], and an inline note[^2](Short note).

[^5]: A numbered note with **Markdown** and a [link](https://example.com).
[^source]: A named note.
```

Numeric aliases retain their displayed number. Named aliases receive available numbers without colliding with numeric aliases. An alias is made of letters/digits/underscores. References can repeat; undefined references remain unchanged. Definitions can span lines up to the next definition or blank line; multi-paragraph note bodies and nested parentheses in the legacy inline-note syntax are not supported.

Code fences, indented code blocks, inline code, escaped markers and HTML attributes are preserved. Footnote IDs are namespaced by post identity so different posts can share note numbers on index/archive pages.

## Configuration

Optional **site** `_config.yml`:

```yaml
reference:
  allow_html: false
  css: true
```

| Option | Default | Meaning |
| --- | --- | --- |
| `allow_html` | `false` | Allow raw HTML inside note bodies only when explicitly enabled for trusted authors |
| `css` | `true` | Generate `css/hexo-reference.css` and inject its stylesheet link into the page head |

The renderer escapes tooltip attributes and decodes text entities exactly once. It is **not a whole-post HTML sanitizer**: your Hexo Markdown renderer and authorship policy still determine whether raw HTML elsewhere in a post is trusted. JavaScript/CSS customizations in a theme remain your responsibility.

Tooltip text is exposed through `aria-label` and can appear on keyboard focus on desktop. On touch/small screens, use the numbered reference link to reach the note. Styling uses `.footnotes`, `.footnotelist` and `.mobile-tooltip-disabled`; turn off generated CSS if your theme supplies its own styles. Subdirectory installations use the configured Hexo `root`.

## Migration from 1.0.x

- Note-body raw HTML now requires `reference.allow_html: true`.
- The former fixed `#footnotes`/`#footnotelist` wrapper IDs are classes, avoiding duplicated IDs on listing pages. Update custom theme selectors if needed.
- Replace old hardcoded `#fn:1` links with the generated per-post references; anchor IDs now include a stable post prefix.
- The external hint.css request is replaced with a local stylesheet. Existing class names used for note markers remain available.

## Development

```sh
npm ci --ignore-scripts
npm test
npm pack --dry-run
```

Tests cover code/escape preservation, aliases, repeated links, attribute escaping and per-post anchors. [Changelog](CHANGELOG.md) · [MIT](LICENSE).

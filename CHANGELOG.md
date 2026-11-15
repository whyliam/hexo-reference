# Changelog

## 1.1.0 (2026-11-15)

Preserve Markdown code/escapes and HTML attributes, isolate anchors by post, avoid double-encoded tooltip text, disable note-body raw HTML unless explicitly enabled, and replace the CSS CDN with local assets. See README migration notes for anchor/selector changes.

## 1.0.6 (2026-11-15)

Preserve numeric aliases, support named/inline notes, keep missing references intact and generate unique repeated-reference IDs. Escape tooltip attributes and make styling deterministic per post. Remove the unused hexo-util and legacy test-tool dependency chains. Authored raw HTML in note bodies remains supported and should only come from trusted authors.

Requires Node.js >=20.19.0.


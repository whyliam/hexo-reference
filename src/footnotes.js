'use strict';

const MarkdownIt = require('markdown-it');
const protect = require('./protect');
const safeMarkdown = new MarkdownIt({html: false});
const trustedMarkdown = new MarkdownIt({html: true});

function escapeAttribute(text) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = function renderFootnotes(text, options = {}) {
  if (typeof text !== 'string') return text;
  const md = options.allow_html === true ? trustedMarkdown : safeMarkdown;
  const protectedText = protect(text, md);
  text = protectedText.text;
  const restore = protectedText.restore;
  const prefix = options.prefix || 'fn';
  const notes = new Map();
  // Definitions can span lines, ending at the next definition or blank line.
  text = text.replace(/\[\^(\w+)\]:[ \t]*([\s\S]+?)(?=\[\^\w+\]:|\n\s*\n|$)/g,
    (match, alias, content) => {
      if (!notes.has(alias)) notes.set(alias, {content});
      return '';
    });
  text = text.replace(/\[\^(\w+)\]\(([^)\n]*)\)/g, (match, alias, content) => {
    if (!notes.has(alias)) notes.set(alias, {content});
    return `[^${alias}]`;
  });
  const used = new Set([...notes.keys()].filter(key => /^\d+$/.test(key)));
  let next = 1;
  for (const [alias, note] of notes) {
    while (used.has(String(next))) next++;
    note.index = /^\d+$/.test(alias) ? alias : String(next++);
    note.content = restore(note.content);
    note.references = 0;
  }
  text = text.replace(/\[\^(\w+)\]/g, (match, alias) => {
    const note = notes.get(alias);
    if (!note) return match;
    note.references++;
    const id = note.index;
    const reference = `${prefix}ref:${id}` + (note.references > 1 ? `-${note.references}` : '');
    const tooltip = escapeAttribute(md.utils.unescapeAll(md.renderInline(note.content.trim()).replace(/<[^>]*>/g, '')));
    return `<sup id="${reference}"><a href="#${prefix}:${id}" rel="footnote">` +
      '<span class="hint--top hint--error hint--medium hint--rounded hint--bounce mobile-tooltip-disabled"' +
      ` aria-label="${tooltip}">[${id}]</span></a></sup>`;
  });
  if (!notes.size) return restore(text);
  const items = [...notes.values()].map(note => {
    const id = note.index;
    return `<li id="${prefix}:${id}"><span style="display: inline-block; vertical-align: top; padding-right: 10px; margin-left: -40px">${id}.</span>` +
      '<span style="display: inline-block; vertical-align: top; margin-left: 10px;display: contents;">' +
      md.renderInline(note.content.trim()) + `<a href="#${prefix}ref:${id}" rev="footnote"> ↩</a></span></li>`;
  }).join('');
  return restore(text) + '<div class="footnotes">' + '<div class="footnotelist">' +
    '<ol style="list-style: none; padding-left: 0; margin-left: 40px">' + items + '</ol></div></div>';
};

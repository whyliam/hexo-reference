'use strict';

const md = require('markdown-it')({html: true});
const mobileStyle = '<style>@media (max-width: 767px) {' +
  '.mobile-tooltip-disabled:after, .mobile-tooltip-disabled:before { display: none !important; }' +
  '}</style>';

function escapeAttribute(text) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = function renderFootnotes(text) {
  if (typeof text !== 'string') return text;
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
    note.references = 0;
  }
  text = text.replace(/\[\^(\w+)\]/g, (match, alias) => {
    const note = notes.get(alias);
    if (!note) return match;
    note.references++;
    const id = note.index;
    const reference = `fnref:${id}` + (note.references > 1 ? `-${note.references}` : '');
    const tooltip = escapeAttribute(md.renderInline(note.content.trim()).replace(/<[^>]*>/g, ''));
    return `<sup id="${reference}"><a href="#fn:${id}" rel="footnote">` +
      '<span class="hint--top hint--error hint--medium hint--rounded hint--bounce mobile-tooltip-disabled"' +
      ` aria-label="${tooltip}">[${id}]</span></a></sup>`;
  });
  if (!notes.size) return text;
  const items = [...notes.values()].map(note => {
    const id = note.index;
    return `<li id="fn:${id}"><span style="display: inline-block; vertical-align: top; padding-right: 10px; margin-left: -40px">${id}.</span>` +
      '<span style="display: inline-block; vertical-align: top; margin-left: 10px;display: contents;">' +
      md.renderInline(note.content.trim()) + `<a href="#fnref:${id}" rev="footnote"> ↩</a></span></li>`;
  }).join('');
  return text + '<div id="footnotes">' + mobileStyle + '<div id="footnotelist">' +
    '<ol style="list-style: none; padding-left: 0; margin-left: 40px">' + items + '</ol></div></div>';
};

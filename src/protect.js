'use strict';

// Keep Markdown code, escaped markers and HTML attributes out of the footnote pass.
module.exports = function protect(text, parser) {
  let prefix = '\u0000FOOTNOTE';
  while (text.includes(prefix)) prefix += '_';
  const values = [];
  const save = value => `${prefix}${values.push(value) - 1}\u0000`;
  const lines = text.split('\n');
  const offsets = [0];
  for (const line of lines) offsets.push(offsets[offsets.length - 1] + line.length + 1);
  const ranges = parser.parse(text, {}).filter(token =>
    ['fence', 'code_block', 'html_block'].includes(token.type) && token.map
  ).map(token => [offsets[token.map[0]], Math.min(text.length, offsets[token.map[1]])]);
  for (const [start, end] of ranges.reverse()) text = text.slice(0, start) + save(text.slice(start, end)) + text.slice(end);
  // Backtick runs only close with a run of the same length (CommonMark code spans).
  let result = '';
  for (let i = 0; i < text.length;) {
    if (text[i] === '\\' && i + 1 < text.length) {
      result += save(text.slice(i, i + 2)); i += 2; continue;
    }
    if (text[i] === '`') {
      let end = i + 1;
      while (text[end] === '`') end++;
      const run = end - i;
      let close = end;
      while (close < text.length) {
        if (text[close] !== '`') {close++; continue;}
        let next = close + 1;
        while (text[next] === '`') next++;
        if (next - close === run) {result += save(text.slice(i, next)); i = next; break;}
        close = next;
      }
      if (close < text.length) continue;
      result += text.slice(i, end); i = end; continue;
    }
    if (text[i] === '<' && /[A-Za-z/!]/.test(text[i + 1] || '')) {
      let end = i + 1; let quote = '';
      for (; end < text.length; end++) {
        const char = text[end];
        if (quote) {if (char === quote) quote = '';}
        else if (char === '"' || char === "'") quote = char;
        else if (char === '>') break;
      }
      if (end < text.length) {result += save(text.slice(i, end + 1)); i = end + 1; continue;}
    }
    result += text[i++];
  }
  const pattern = new RegExp(prefix + '(\\d+)\u0000', 'g');
  function restore(value) {
    let previous;
    do {previous = value; value = value.replace(pattern, (match, index) => values[index]);} while (value !== previous);
    return value;
  }
  return {text: result, restore};
};

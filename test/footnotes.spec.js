'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const render = require('../src/footnotes');
test('numeric aliases retain their identity and inline Markdown renders', () => {
  const html = render('Hello[^13] [^13]: a [link](https://example.com)');
  assert.match(html, /href="#fn:13"/);
  assert.match(html, /<a href="https:\/\/example.com">link<\/a>/);
});
test('inline and named references work, missing references survive', () => {
  assert.match(render('Hi[^2](friend)'), /id="fn:2"/);
  const html = render('Hello[^name] and [^missing]\n\n[^name]: a note');
  assert.match(html, /href="#fn:1"/);
  assert.match(html, /\[\^missing\]/);
});
test('tooltip content cannot escape the attribute', () => {
  const html = render('Hi[^1] [^1]: " onmouseover="alert(1)');
  assert.doesNotMatch(html, /aria-label="" onmouseover=/);
  assert.match(html, /&quot;/);
});
test('renders independently for every post and does not mutate global state', () => {
  const input = 'Hello[^1] [^1]: note';
  assert.equal(render(input), render(input));
  assert.equal(render('No notes'), 'No notes');
  assert.equal(render(undefined), undefined);
});
test('repeated references have distinct IDs and multiline definitions do not consume the next note', () => {
  const html = render('Hi[^1][^1][^named]\n\n[^1]: one\nline\n[^named]: two');
  assert.match(html, /id="fnref:1-2"/);
  assert.match(html, /id="fn:2"/);
  assert.match(html, /two/);
});

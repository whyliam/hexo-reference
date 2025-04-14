/* eslint-disable no-unused-vars */
const should = require('chai').should();
/* eslint-enable no-unused-vars */
const footnotes = require('./../src/footnotes');

describe('footnotes', () => {
  // 提取公共的预期输出模板，减少重复代码
  const getExpectedOutput = (id, content, footnoteContent) => {
    return `hey buddy<sup id="fnref:${id}"><a href="#fn:${id}" rel="footnote"><span class="hint--top hint--error hint--medium hint--rounded hint--bounce" aria-label="${content}">[${id}]</span></a></sup>, it's a test` +
      (footnoteContent ? ' ' : '') +
      '<div id="footnotes">' +
      '<hr>' +
      '<div id="footnotelist">' +
      '<ol style="list-style: none; padding-left: 0; margin-left: 40px">' +
      `<li id="fn:${id}">` +
      '<span style="display: inline-block; vertical-align: top; padding-right: 10px; margin-left: -40px">' +
      `${id}.` +
      '</span>' +
      '<span style="display: inline-block; vertical-align: top; margin-left: 10px;">' +
      `${footnoteContent || content}` +
      `<a href="#fnref:${id}" rev="footnote"> ↩</a></span></li></ol></div></div>`;
  };

  it('render (basic)', () => {
    const input = 'hey buddy[^5], it\'s a test [^5]: basic footnote content';
    const content = footnotes(input);
    content.should.equal(getExpectedOutput('5', 'basic footnote content', null));
  });

  it('render (random number)', () => {
    const input = 'hey buddy[^13], it\'s a test [^13]: basic footnote content';
    const content = footnotes(input);
    content.should.equal(getExpectedOutput('13', 'basic footnote content', null));
  });

  it('render (inline footnote)', () => {
    const input = 'hey buddy[^2](friend), it\'s a test';
    const content = footnotes(input);
    content.should.equal(getExpectedOutput('2', 'friend', null));
  });

  it('render (with markdown content)', () => {
    const input = 'hey buddy[^13], it\'s a test [^13]: basic footnote [content](http://example.com)';
    const rawContent = 'basic footnote [content](http://example.com)';
    const renderedContent = 'basic footnote <a href="http://example.com">content</a>';
    const content = footnotes(input);
    content.should.equal(getExpectedOutput('13', rawContent, renderedContent));
  });
});

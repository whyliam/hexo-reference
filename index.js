'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const renderFootnotes = require('./src/footnotes');

hexo.extend.filter.register('before_post_render', function(data) {
  const options = hexo.config.reference || {};
  const identity = data.path || data.slug || data.permalink || data.title || 'post';
  const prefix = 'fn-' + crypto.createHash('sha256').update(String(identity)).digest('hex').slice(0, 12);
  data.content = renderFootnotes(data.content, {allow_html: options.allow_html, prefix});
  return data;
});
if ((hexo.config.reference || {}).css !== false) {
  const root = (hexo.config.root || '/').replace(/\/$/, '') + '/';
  hexo.extend.generator.register('reference_styles', () => ({
    path: 'css/hexo-reference.css', data: fs.readFileSync(path.join(__dirname, 'assets/reference.css'), 'utf8')
  }));
  hexo.extend.injector.register('head_end', `<link rel="stylesheet" href="${root}css/hexo-reference.css">`);
}

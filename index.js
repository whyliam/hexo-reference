'use strict';

const renderFootnotes = require('./src/footnotes');
hexo.extend.filter.register('before_post_render', function(data) {
  data.content = renderFootnotes(data.content);
  return data;
});
hexo.extend.filter.register('after_post_render', function(data) {
  data.content = '<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/hint.css/3.0.0/hint.min.css">' + data.content;
  return data;
});

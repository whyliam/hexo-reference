'use strict';

var md = require('markdown-it')({
    // allow HTML tags
    html: true
});

/**
 * Render markdown footnotes
 * @param {String} text
 * @returns {String} text
 */
function renderFootnotes(text) {
    var footnotes = [];
    var reFootnoteContent = /\[\^(\w+)\]: ?([\S\s]+?)(?=\[\^(?:\d+)\]|\n\n|$)/g;
    var reInlineFootnote = /\[\^(\w+)\]\((.+?)\)/g;
    var reAliasFootnote = /\[\^(\w+)\]/g;
    var reFootnoteIndex = /\[\^(\d+)\]/g;

    var html = '';
    var global_index = 0;
    
    // 添加响应式样式，只在第一次调用时添加
    var styleInjected = false;
    if (!global.footnoteStyleInjected) {
        html += '<style>';
        html += '@media (max-width: 767px) {';
        html += '[class*=hint--]:after, [class*=hint--]:before { display: none !important; }';
        html += '}';
        html += '</style>';
        global.footnoteStyleInjected = true;
        styleInjected = true;
    }

    // create map for looking footnotes array
    function createLookMap(field) {
        var map = {}
        for (var i = 0; i < footnotes.length; i++) {
            var item = footnotes[i]
            if (field in item) {
                var key = item[field]
                map[key] = item
            }
        }
        return map
    }

    // firstly collect and clear all footnote contents 匹配脚注定义（如 [^alias]: content）。
    text = text.replace(reFootnoteContent, function (match, alias, content) {
        footnotes.push({
            alias: alias,
            content: content
        });
        // remove footnote content
        return '';
    });

    // loop all inline footnotes, convert to alias style 匹配内联脚注（如 [^alias](content)）。
    text = text.replace(reInlineFootnote, function (match, alias, content) {
        footnotes.push({
            alias: alias,
            content: content
        });
        // remove content of inline footnote, return as footnote index
        return '[^' + alias + ']';
    });

    var aliasMap = createLookMap("alias")

    // loop all alias footnotes, update and leave index 匹配脚注引用（如 [^alias]）。
    text = text.replace(reAliasFootnote, function (match, alias) {
        if (aliasMap.hasOwnProperty(alias)) {
            // 检查是否已经有索引，如果没有才分配新索引
            if (!aliasMap[alias].hasOwnProperty('index')) {
                aliasMap[alias].index = ++global_index;
            }
            // 返回已分配的索引
            return '[^' + aliasMap[alias].index + ']';
        }
        // 如果找不到别名，返回空字符串
        return '';
    });

    var indexMap = createLookMap("index")

    // render (HTML) footnotes reference 匹配脚注索引（如 [^index]）。
    text = text.replace(reFootnoteIndex, 
        function(match, index){
            if (!indexMap.hasOwnProperty(index) || !indexMap[index].hasOwnProperty("content")) {
                return ''
            }

            var tooltip = indexMap[index].content;
            // 先渲染 markdown 为 HTML，然后去除 HTML 标签，只保留文本内容
            var renderedTooltip = md.renderInline(tooltip.trim()).replace(/<[^>]*>/g, '');
            return '<sup id="fnref:' + index + '">' +
                '<a href="#fn:'+ index +'" rel="footnote">' +
                '<span class="hint--top hint--error hint--medium hint--rounded hint--bounce" aria-label="'
                + renderedTooltip +
                '">[' + index +']</span></a></sup>';
    });

    // delete the footnotes that only has footnote-detail but no mark in text (no index).
    var i = footnotes.length;
    while(i--) {
        if (!footnotes[i].hasOwnProperty("index")) {
            footnotes.splice(i, 1)
        }
    }

    // sort footnotes by their index
    footnotes.sort(function (a, b) {
        return a.index - b.index;
    });

    // render footnotes (HTML)
    footnotes.forEach(function (footNote) {
        html += '<li id="fn:' + footNote.index + '">';
        html += '<span style="display: inline-block; vertical-align: top; padding-right: 10px; margin-left: -40px">';
        html += footNote.index;
        html += '.</span>';
        html += '<span style="display: inline-block; vertical-align: top; margin-left: 10px;">';
        html += md.renderInline(footNote.content.trim());
        html += '<a href="#fnref:' + footNote.index + '" rev="footnote"> ↩</a></span></li>';
    });

    // add footnotes at the end of the content
    if (footnotes.length) {
        text += '<div id="footnotes">';
        if (!styleInjected) {
            text += '<style>';
            text += '@media (max-width: 767px) {';
            text += '[class*=hint--]:after, [class*=hint--]:before { display: none !important; }';
            text += '}';
            text += '</style>';
        }
        text += '<div id="footnotelist">';
        text += '<ol style="list-style: none; padding-left: 0; margin-left: 40px">' + html + '</ol>';
        text += '</div></div>';
    }
    return text;
}
module.exports = renderFootnotes;

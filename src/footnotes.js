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
        // 直接分配索引号
        global_index++;
        footnotes.push({
            alias: alias,
            content: content,
            index: global_index
        });
        // remove footnote content
        return '';
    });

    // 创建索引映射，使用索引值作为键
    var indexMap = {};
    for (var i = 0; i < footnotes.length; i++) {
        indexMap[footnotes[i].index] = footnotes[i];
    }

    // render (HTML) footnotes reference 匹配脚注索引（如 [^index]）。
    text = text.replace(reFootnoteIndex, 
        function(match, index){
            if (!indexMap.hasOwnProperty(index)) {
                return '';
            }
            if (!indexMap[index].hasOwnProperty("content")) {
                return ''
            }

            var tooltip = indexMap[index].content;
            // 先渲染 markdown 为 HTML，然后去除 HTML 标签，只保留文本内容
            var renderedTooltip = md.renderInline(tooltip.trim()).replace(/<[^>]*>/g, '');
            return '<sup id="fnref:' + index + '">' +
                '<a href="#fn:'+ index +'" rel="footnote">' +
                '<span class="hint--top hint--error hint--medium hint--rounded hint--bounce mobile-tooltip-disabled" aria-label="'
                + renderedTooltip +
                '">[' + index +']</span></a></sup>';
    });

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
        html += '<span style="display: inline-block; vertical-align: top; margin-left: 10px;display: contents;">';
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
            text += '.mobile-tooltip-disabled:after, .mobile-tooltip-disabled:before { display: none !important; }';
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

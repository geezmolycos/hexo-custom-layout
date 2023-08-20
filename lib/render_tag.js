'use strict';

const wrapComments = require('./wrap_comments');
const { parse: yfm } = require('hexo-front-matter');

module.exports = (hexo) => {
    // render text with engine
    hexo.extend.tag.register('render', function(args, content) {
        let engine = args[0];
        return wrapComments('render', hexo.render.render({text: content, engine: engine}), args);
    }, {ends: true, async: true});
    
    // render text with front matter
    hexo.extend.tag.register('renderwith', function(args, content) {
        let engine = args[0];
        let data = yfm(content);
        data._parent ??= this; // make parent variables available to layout
        return wrapComments('render', hexo.render.render({text: data._content, engine: engine}, data), args);
    }, {ends: true, async: true});
}

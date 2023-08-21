'use strict';

const { getActualLayoutPathFromArgs, getLayoutArgsFromData } = require('./layout_path_resolver');
const wrapComments = require('./wrap_comments');
const path = require('path');

module.exports = (hexo) => {
    // Disable rendering for snippet
    hexo.config.exclude ??= new Array();
    hexo.config.skip_render ??= new Array();
    hexo.config.exclude.push('(**).snippet.*([^./\\\\])');
    hexo.config.skip_render.push('(**).snippet.*([^./\\\\])');

    // render snippet file
    hexo.extend.tag.register('snippet', function(args) {
        let sourcePath = args[0];
        let pathType = args[1];
        sourcePath = getActualLayoutPathFromArgs(sourcePath, pathType, this.source, hexo.source_dir);
        if (!pathType){
            args[1] = "from"; // to render in comment wrap
        }
        sourcePath = sourcePath.replace(/\.([^./\\]*)$/, '.snippet.$1');
        return wrapComments('snippet', hexo.render.render({path: sourcePath}), args);
    }, {async: true});

    hexo.extend.tag.register('snippetwith', function(args, content) {
        let yamlRenderer = hexo.extend.renderer.get('yml', false);
        return yamlRenderer({text: content}).then(contentObject => {
            let sourcePath = args[0];
            let pathType = args[1];
            if (sourcePath){
                sourcePath = getActualLayoutPathFromArgs(sourcePath, pathType, this.source, hexo.source_dir);
                if (!pathType){
                    args[1] = "from"; // to render in comment wrap
                }
            } else {
                throw new Error('snippetwith no source path');
            }
            contentObject.parent ??= this; // make parent variables available to layout
            sourcePath = sourcePath.replace(/.([^./\\]*)$/, '.snippet.$1');
            return wrapComments('snippet', hexo.render.render({path: sourcePath}, contentObject), args);
        });
    }, {ends: true, async: true});
}

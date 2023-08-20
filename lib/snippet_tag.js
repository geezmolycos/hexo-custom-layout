'use strict';

const { getActualLayoutPathFromArgs } = require('./layout_path_resolver');
const wrapComments = require('./wrap_comments');

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
        sourcePath = sourcePath.replace(/.([^./\\]*)$/, '.snippet.$1');
        return wrapComments('snippet', hexo.render.render({path: sourcePath}), args);
    }, {async: true});

    hexo.extend.tag.register('snippetwith', function(args, content) {
        let yamlRenderer = hexo.extend.renderer.get('yml', false);
        return yamlRenderer({text: content}).then(contentObject => {
            let sourcePath = args[0];
            let pathType = args[1];
            if (sourcePath){
                sourcePath = getActualLayoutPathFromArgs(sourcePath, pathType, this.source, hexo.source_dir);
            } else {
                // get sourcePath from content
                contentObject.source ??= this.source;
                sourcePath = path.join(hexo.source_dir, contentObject.source);
            }
            contentObject._parent ??= this; // make parent variables available to layout
            sourcePath = sourcePath.replace(/.([^./\\]*)$/, '.snippet.$1');
            return wrapComments('snippet', hexo.render.render({path: sourcePath}, contentObject), args);
        });
    }, {ends: true, async: true});
}

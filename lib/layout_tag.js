'use strict';

const {getActualLayoutPath, getActualLayoutPathFromArgs} = require('./layout_path_resolver');
const {wrapComments} = require('./wrap_comments');

module.exports = (hexo) => {
    hexo.extend.tag.register('layout', function(args) {
        let layoutPath = args[0];
        let pathType = args[1];
        layoutPath = getActualLayoutPathFromArgs(layoutPath, pathType, this.source);
        return wrapComments('layout', hexo.theme.getView(layoutPath).render({page: this}), args);
    }, {async: true});
    hexo.extend.tag.register('layoutwith', function(args, content) {
        let yamlRenderer = hexo.extend.renderer.get('yml', false);
        return yamlRenderer({text: content}).then(contentObject => {
            let layoutPath = args[0];
            let pathType = args[1];
            if (layoutPath){
                layoutPath = getActualLayoutPathFromArgs(layoutPath, pathType, this.source);
            } else {
                // get layoutPath from content
                contentObject.source ??= this.source;
                layoutPath = getActualLayoutPath(contentObject);
            }
            contentObject.page ??= this; // make parent variables available to layout
            return wrapComments('layout', hexo.theme.getView(layoutPath).render(contentObject), args);
        });
    }, {ends: true, async: true});
}

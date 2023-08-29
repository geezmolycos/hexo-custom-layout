'use strict';

const {getActualLayoutPath, getActualLayoutPathFromArgs, getLayoutArgsFromData} = require('./layout_path_resolver');
const wrapComments = require('./wrap_comments');

module.exports = (hexo) => {
    function generateLocals(path, data){
        const Locals = hexo._generateLocals();
        Locals.prototype.cache = false;
        return hexo.execFilter('template_locals', new Locals(path, data), { context: hexo }).catch(err => {
            throw new Error("template_locals failed", { cause: err });
        });
    }

    hexo.extend.tag.register('layout', function(args) {
        let layoutPath = args[0];
        let pathType = args[1];
        layoutPath = getActualLayoutPathFromArgs(layoutPath, pathType, this.source);
        if (!pathType){
            args[1] = "from"; // to render in comment wrap
        }
        return generateLocals(this.path, this).then(locals => {
            return wrapComments('layout', hexo.theme.getView(layoutPath).render(locals), args);
        }).catch(err => {
            return wrapComments('layouterror', err.message, args);
        });
    }, {async: true});
    const yamlRenderer = hexo.extend.renderer.get('yml', false);
    hexo.extend.tag.register('layoutwith', function(args, content) {
        return yamlRenderer({text: content}).then(contentObject => {
            let layoutPath = args[0];
            let pathType = args[1];
            layoutPath = getActualLayoutPathFromArgs(layoutPath, pathType, this.source);
            if (!pathType){
                args[1] = "from"; // to render in comment wrap
            }
            const data = Object.assign({}, this);
            return generateLocals(this.path, data).then(locals => {
                Object.assign(locals, contentObject);
                return wrapComments('layout', hexo.theme.getView(layoutPath).render(locals), args);
            });
        }).catch(err => {
            return wrapComments('layouterror', err.message, args);
        });
    }, {ends: true, async: true});
}

'use strict';

const source_prefix = 'source/';

module.exports = (hexo) => {
    // Exclude portable layout files
    hexo.config.exclude ??= new Array();
    hexo.config.skip_render ??= new Array();
    hexo.config.exclude.push('(**).layout.*([^./\\\\])');
    hexo.config.skip_render.push('(**).layout.*([^./\\\\])');
    
    // Match files like "main.layout.njk" "example.layout.ejs"
    hexo.extend.processor.register(/\.layout\.[^./\\]*$/, function(file){
        // remove ".layout" part
        let virtualPath = source_prefix + file.path.replace(/\\/g, '/').replace(/\.layout\.([^./\\]*)$/, '.$1');
        return file.read().then((content) => hexo.theme.setView(virtualPath, content));
    });
}

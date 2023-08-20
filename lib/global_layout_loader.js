'use strict';
const fs = require('hexo-fs');
const path = require('path');

module.exports = (hexo) => {
    function load_layout_file(path, virtualPath){
        let content = fs.readFileSync(path);
        hexo.theme.setView(virtualPath, content);
    }

    function global_layout_loader(){
        // load global layouts from "layout" directory
        const layoutDir = path.join(hexo.base_dir, (hexo.config.layout_dir || 'layout')).replace(/\\/g, '/').replace(/\/$/, '');
        const files = fs.listDirSync(layoutDir);

        files.forEach(function(file) {
            file = file.replace(/\\/g, '/');
            let filePath = layoutDir + '/' + file;
            load_layout_file(filePath, file);
            hexo.log.debug(`Loaded custom layout ${file}`);
        });
    }

    global_layout_loader();
}
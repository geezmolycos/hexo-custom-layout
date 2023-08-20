'use strict';

const Promise = require('bluebird');
const path = require('path');

// makes renderable files with '.page' under post asset folder to be pages

module.exports = (hexo) => {
    // find the processor responsible for pages (for later use)
    const originalExclude = hexo.config.exclude;
    hexo.config.exclude = []; // temporarily remove exclude rules
    const pageProcessor = hexo.extend.processor.list().find(processor => processor.pattern.test('dummy'));
    hexo.config.exclude = originalExclude;
    
    // Disable rendering for page asset
    hexo.config.exclude ??= new Array();
    hexo.config.skip_render ??= new Array();
    hexo.config.exclude.push('(**).page.*([^./\\\\])');
    hexo.config.skip_render.push('(**).page.*([^./\\\\])');
    
    let pendingFiles = [];
    let basePost = new Map();
    
    hexo.extend.processor.register(/.page.[^./\\]*?/, function(file){
        pendingFiles.push(file);
    });
    
    // as all posts required are loaded, generate pages
    hexo.extend.filter.register('before_generate', function(){
        const Post = hexo.model('Post');
        const Page = hexo.model('Page');
        return Promise.all(pendingFiles.map(file => {
            // TODO: Better post searching
            const post = Post.toArray().find(post => file.source.startsWith(post.asset_dir));
            if (!post){
                hexo.log.warn(`No post found for ${file.source}. It may not be in a post asset folder.`);
                return;
            }
            let relativeToAssetDir = path.posix.normalize(path.relative(post.asset_dir, file.source).replace(/\\/g, '/'));
            let fullpath = path.posix.join(post.path, relativeToAssetDir).replace(/.page.([^./\\]*)$/, '.$1');
            file.params.renderable = hexo.render.isRenderable(fullpath);
            file.path = fullpath;
            if (file.type == 'delete'){ // for binding variables to pages
                basePost.delete(fullpath);
            } else {
                basePost.set(fullpath, post.path);
            }
            return pageProcessor.process(file);
        })).then(() => {
            pendingFiles = [];
            return Promise.all(Array.from(basePost.entries()).map(([fullpath, basepath]) => {
                return Page.update({source: fullpath}, {
                    base_post_path: basepath,
                    base_post_link: hexo.extend.helper.get('url_for').bind(hexo)(basepath)
                }); // set variable to use in the page
            }));
        });
    }, 9);
}

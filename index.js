'use strict';

// add custom layouts to theme

// also enables to load layout directly from source folder
// specify 'layout_from' in front matter to use relative path

// also provides with a tag to render and insert a layout partial

const path = require('path');
const Promise = require('bluebird');

// Global layout loader
require('./lib/global_layout_loader')(hexo);

// local layout loader
require('./lib/local_layout_loader')(hexo);

const {getActualLayoutPath} = require('./lib/layout_path_resolver');

// Normalize layout references
// Resolve relative layout
hexo.extend.filter.register('before_post_render', function(data){
    // If relative layout path is not used, return
    if (!data.layout_from && !data.layout_asset){
        return data;
    }
    data.layout = getActualLayoutPath(data);
    return data;
});

const wrapComments = require('./lib/wrap_comments');

// tags for rendering
require('./lib/layout_tag')(hexo);
require('./lib/render_tag')(hexo);
require('./lib/snippet_tag')(hexo);

// asset pages
require('./lib/asset_pages')(hexo);

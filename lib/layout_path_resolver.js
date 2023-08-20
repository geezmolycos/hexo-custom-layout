'use strict';

const path = require('path');

const source_prefix = 'source/';

const getRelativeLayoutPath = function(source, relative, prefix=source_prefix){
    return prefix + path.posix.join(path.posix.dirname(source.replace(/\\/g, '/')), relative.replace(/\\/g, '/'));
}

const getAssetLayoutPath = function(source, relative, prefix=source_prefix){
    return prefix + path.posix.join(source.replace(/\\/g, '/').replace(/\.[^/\\.]+$/, ""), relative.replace(/\\/g, '/'));
}

exports.getActualLayoutPath = function(data, prefix){
    // compute actual layout path
    let layout = data.layout;
    if (data.layout_from){
        layout = getRelativeLayoutPath(data.source, data.layout_from, prefix);
    }
    if (data.layout_asset){
        layout = getAssetLayoutPath(data.source, data.layout_asset, prefix);
    }
    return layout;
}

exports.getActualLayoutPathFromArgs = function(layoutPath, pathType, source, prefix){
    if (!pathType){
        pathType = 'from';
    }
    if (pathType === 'from'){
        layoutPath = getRelativeLayoutPath(source, layoutPath, prefix);
    } else if (pathType == 'asset'){
        layoutPath = getAssetLayoutPath(source, layoutPath, prefix);
    }
    return layoutPath;
}

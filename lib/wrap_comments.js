'use strict';

const Promise = require('bluebird');
const { escapeHTML } = require('hexo-util');

function wrapCommentsSync(name, string, args){
    let argLine = '';
    args.forEach(arg => {
        argLine += ' ' + escapeHTML(arg);
    });
    return (
        '<!-- ' + name + argLine + ' -->\n'
        + string
        + '\n<!-- end' + name + argLine + ' -->'
        );
}

function wrapComments(name, string, args){
    if (string instanceof Promise){
        return string.then(s => wrapCommentsSync(name, s, args));
    } else {
        return wrapCommentsSync(name, string, args);
    }
}

module.exports = wrapComments;

'use strict';

const should = require('chai').should();
const path = require('path');
const Promise = require('bluebird');
const fs = require('hexo-fs');
const yaml = require('js-yaml');

describe('layout path resolver', () => {
    const {
        getActualLayoutPath, getActualLayoutPathFromArgs, getLayoutArgsFromData
    } = require('../lib/layout_path_resolver');
    describe('getActualLayoutPath', () => {
        it('only layout', () => {
            getActualLayoutPath({
                source: 'foo/bar.html',
                layout: 'page'
            }).should.equal('page');
        });
        it('only layout asset', () => {
            getActualLayoutPath({
                source: 'foo/bar.html',
                layout_asset: 'baz'
            }).should.equal('source/foo/bar/baz');
        });
        it('layout from should take precedence', () => {
            getActualLayoutPath({
                source: 'foo/bar.html',
                layout: 'page',
                layout_from: 'baz'
            }).should.equal('source/foo/baz');
        });
        it('layout asset should take precedence over all others', () => {
            getActualLayoutPath({
                source: 'foo/bar.html',
                layout: 'page',
                layout_from: 'baz',
                layout_asset: 'foobar'
            }).should.equal('source/foo/bar/foobar');
        });
    });
    describe('getActualLayoutPathFromArgs', () => {
        it('from', () => {
            getActualLayoutPathFromArgs(
                'layout',
                'from',
                'foo/bar.html',
                'source1/'
            ).should.equal('source1/foo/layout');
        });
        it('asset', () => {
            getActualLayoutPathFromArgs(
                'layout',
                'asset',
                'foo/bar.html',
                'source1/'
            ).should.equal('source1/foo/bar/layout');
        });
        it('absolute', () => {
            getActualLayoutPathFromArgs(
                'layout',
                'abs',
                'foo/bar.html',
                'source1/'
            ).should.equal('layout');
        });
        it('no type', () => {
            getActualLayoutPathFromArgs(
                'layout',
                '',
                'foo/bar.html',
                'source1/'
            ).should.equal('source1/foo/layout');
        });
    });
    describe('getLayoutArgsFromData', () => {
        it('only layout', () => {
            getLayoutArgsFromData({
                source: 'foo/bar.html',
                layout: 'page'
            }).should.deep.equal(['page', 'global']);
        });
        it('only layout asset', () => {
            getLayoutArgsFromData({
                source: 'foo/bar.html',
                layout_asset: 'baz'
            }).should.deep.equal(['baz', 'asset']);
        });
        it('layout from should take precedence', () => {
            getLayoutArgsFromData({
                source: 'foo/bar.html',
                layout: 'page',
                layout_from: 'baz'
            }).should.deep.equal(['baz', 'from']);
        });
        it('layout asset should take precedence over all others', () => {
            getLayoutArgsFromData({
                source: 'foo/bar.html',
                layout: 'page',
                layout_from: 'baz',
                layout_asset: 'foobar'
            }).should.deep.equal(['foobar', 'asset']);
        });
    });
});

describe('wrap comments', () => {
    const wrapComments = require('../lib/wrap_comments');
    it('sync', () => {
        wrapComments('render', 'hello world', ['page']).should.equal([
            '<!-- render page -->',
            'hello world',
            '<!-- endrender page -->',
        ].join('\n'));
    });
    it('should escape properly', () => {
        wrapComments('render', 'hello, world', ['<script>alert("hacked");</script>']).should.match(/&lt;script&gt;/);
    });
    it('async', async () => {
        (await wrapComments('render', new Promise((resolve, reject) => {
            resolve('hello async');
        }), ['page'])).should.equal([
            '<!-- render page -->',
            'hello async',
            '<!-- endrender page -->',
        ].join('\n'));
    });
});

describe('custom layout', () => {
    const Hexo = require('hexo');
    const hexo = new Hexo(path.join(__dirname, 'fixture/site'), {silent: true});
    hexo.env.init = true;
    hexo.extend.filter.register('after_init', () => {
        return hexo.loadPlugin(require.resolve('../'));
    });

    let Post;
    before(async ()=>{
        await hexo.init();
        await hexo.load();
        Post = hexo.model('Post');
    });

    it('basic hexo functionality', async () => {
        let basic = Post.findOne({source: '_posts/basic.html'});
        basic.content.should.equal('Hello!\n');
    });

    // load other test cases from 'expect' directory
    // each yaml contains a list, in which each item is as follows:
    // title: description of this case
    // route or source: matching target: route means theme-rendered; source means before theme rendering
    // expect: expected content
    
    const expectDir = path.join(__dirname, 'fixture/expect');
    for (let filename of fs.listDirSync(expectDir)){
        let withoutExt = path.parse(filename).name;
        let filepath = path.join(expectDir, filename);
        let expects = yaml.load(fs.readFileSync(filepath, {encoding: 'utf8'}));
        describe(withoutExt, () => {
            for (let item of expects){
                if (item.source){
                    it(item.title, () => {
                        let post = Post.findOne({source: '_posts/' + withoutExt + '/' + item.source + '.html'});
                        post.content.should.equal(item.expect);
                    });
                } else if (item.route){
                    it(item.title, () => {
                        let content = hexo.route.get(hexo.route.format(withoutExt  + '/' + item.route));
                        content.setEncoding('utf8');
                        let text = '';
                        content.on('data', (chunk) => {
                            text += chunk;
                        });
                        return new Promise((resolve, reject) => {
                            content.on('end', () => {
                                text.should.equal(item.expect);
                                resolve();
                            });
                            content.on('error', (e) => {
                                reject(e);
                            });
                        });
                    });
                }
            }
        });
    }
});

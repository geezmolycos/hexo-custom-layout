# Hexo custom layout

This [Hexo](https://github.com/hexojs/hexo) plugin allows user to:

- Load custom layouts without modifying theme files
- Apply custom layouts from a relative path or from post asset folder
- Use tags to insert another file into posts or pages
  - Markdown, HTML, etc.
- Insert templates into posts or pages
  - Nunjucks, EJS, etc. Same as layouts
  - Can pass arguments when referencing
- Generate sub pages as standalone pages in post asset folders

[Changelog](./CHANGELOG.md)

## Quick Start

### Global custom layout

The plugin provides a config key `layout_dir` for setting the name of directory that stores global layouts.
The default value is `layout`.

For example, your website has a video collection and you want to create a layout to be applied to all video pages, so that you only need to write the video file address in the front matter, and the template will build the video page.

- Create `layout` folder in your website root directory (same level as `source`)
- Write a template `video.ejs` according to guides on hexo theme
- Put `video.ejs` in `layout`
- Add `layout: video` in the front matter of your video pages

### Portable custom layout

You can also put layouts together with your pages, in `source` folder. Name those in the format of `<name>.layout.ejs` or `<name>.layout.njk`, and write `layout_from: example` in the front matter of the page you want to apply to.

**source/_post/example.layout.njk**
```html
<body>
  <h1>{{ page.title }}</h1>
  <div>Behold! {{ page.content }}</div>
</body>
```

**source/_post/main.html**
```html
---
title: Welcome
layout_from: example
---
The great and powerful Triksyie!
```

**Rendered result**
```html
<body>
  <h1>Welcome</h1>
  <div>Behold! The great and powerful Triksyie!</div>
</body>
```

### Include snippet file

Use the nunjucks tag `snippet` to include a snippet file. The snippet file must be named as `<name>.snippet.html`, or `<name>.snippet.md`, etc.

**source/_post/avatar.snippet.html**
```html
<div class='avatar'>
  <img src='/images/avatar.png'></img>
</div>
```

**source/_post/main.html**
```html
<body>
  This is my avatar:
  {% snippet avatar.html %}
</body>
```

Note that you must remove the `.snippet` part in the filename when referencing.

**Rendered result**
```html
<body>
  This is my avatar:
  <div class='avatar'>
    <img src='/images/avatar.png'></img>
  </div>
</body>
```

Besides that, the second parameter of the tag can be chosen from `from`, `asset`, and `global`.
They corresponds to relative path, path in post asset folder, and global path.
In the example above, `{% snippet bibliography.md asset %}` will reference `source/_post/main/bibliography.md`.

Inserting templates works similarly. See [relevant test files](./test/fixture/site/source/_posts/layout_tag/) for example usage

### Asset pages

Put pages in post asset folder and name them as `<name>.page.<ext>` to render them as standalone pages.
[See tests for examples.](./test/fixture/site/source/_posts/asset_pages/)

See under [test](./test/README.md) for more examples.


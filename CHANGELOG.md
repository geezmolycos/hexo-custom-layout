# Change Log

## [1.1.1] - 2023-09-03

- Update `site` local variable cache when file are loaded, allowing layout tags to read post or page info

## [1.1.0] - 2023-08-29

- Properly uses `template_locals` to generate local variables for `layout` and `layoutwith` tags

## [1.0.0] - 2023-08-22

- Allow loading global layouts without modifying theme
- Allow loading local layouts including those in post asset folders
  - Posts or pages can set their layout using relative path
- Add `layout` and `layoutwith` tags to insert template partials
- Add `render` and `renderwith` tags to render part of page in another language
- Add `snippet` and `snippetwith` tags to insert other files into current page
- Add asset pages, which are standalone pages in post asset folder

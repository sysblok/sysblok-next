// Стили WordPress для блочной разметки контента (Gutenberg и Advanced Gutenberg).
// Берём их прямо с WordPress-сайта, чтобы они совпадали с версией WP и плагинов.
// global-styles, classic-themes и стили темы не грузим: нужные правила перенесены в globals.css / entry.css.
const WORDPRESS_STYLESHEETS = [
  '/wp-includes/css/dist/block-library/style.min.css',
  '/wp-content/plugins/advanced-gutenberg/assets/css/blocks.css',
]

export function WordPressStyles() {
  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL

  return WORDPRESS_STYLESHEETS.map((path) => (
    <link key={path} rel="stylesheet" href={`${baseUrl}${path}`} precedence="wordpress" />
  ))
}

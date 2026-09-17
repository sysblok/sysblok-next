/**
 * TEMPORARY: replaced content with test blocks for layout comparison.
 * Revert with: git checkout -- app/pages/[slug]/page.tsx
 */

export default function Page() {
  return (
    <section>
      <div
        className="container-fluid container-fluid-with-max-width"
        style={{ background: 'rgba(0,0,0,0.04)' }}
      >
        <div className="entry-full">
          <div
            style={{
              background: 'rgba(0,0,0,0.08)',
              padding: '4px',
              marginBottom: '10px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            container-fluid-with-max-width boundary
          </div>

          <h1 style={{ background: 'rgba(255,0,0,0.15)' }}>Heading 1 — Заголовок первого уровня</h1>
          <h2 style={{ background: 'rgba(0,180,0,0.15)' }}>Heading 2 — Заголовок второго уровня</h2>
          <h3 style={{ background: 'rgba(0,0,255,0.15)' }}>
            Heading 3 — Заголовок третьего уровня
          </h3>
          <h4 style={{ background: 'rgba(255,180,0,0.15)' }}>
            Heading 4 — Заголовок четвёртого уровня
          </h4>
          <h5 style={{ background: 'rgba(255,0,255,0.15)' }}>
            Heading 5 — Заголовок пятого уровня
          </h5>
          <h6 style={{ background: 'rgba(0,255,255,0.15)' }}>
            Heading 6 — Заголовок шестого уровня
          </h6>

          <p style={{ background: 'rgba(255,0,0,0.1)' }}>
            Paragraph — абзац текста для проверки размера шрифта, межстрочного интервала и отступов.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod nisi vel
            ante consequat, id tincidunt nisl aliquam.
          </p>
          <p style={{ background: 'rgba(0,180,0,0.1)' }}>
            Second paragraph — второй абзац, проверяем margin между абзацами. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>

          <p>
            <a href="#">Link — ссылка, проверяем цвет #3e859b</a>
          </p>

          <blockquote style={{ background: 'rgba(0,0,255,0.1)' }}>
            Blockquote — цитата. Проверяем размер шрифта 28px, Georgia, красную левую полосу и
            отступы.
          </blockquote>

          <ul>
            <li style={{ background: 'rgba(255,0,0,0.08)' }}>Unordered list item 1</li>
            <li style={{ background: 'rgba(0,180,0,0.08)' }}>Unordered list item 2</li>
          </ul>

          <ol>
            <li style={{ background: 'rgba(0,0,255,0.08)' }}>Ordered list item 1</li>
            <li style={{ background: 'rgba(255,180,0,0.08)' }}>Ordered list item 2</li>
          </ol>
        </div>
      </div>
    </section>
  )
}

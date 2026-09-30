import './entry.css'

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="section-main-content">
      <div className="container-fluid container-fluid-with-max-width">{children}</div>
    </section>
  )
}

import { getFooter } from '@/lib/wordpress'
import { Section, Container } from '@/components/craft'
import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/social-links'
import { AboutArea } from '@/components/aboutArea'

const headingClasses =
  '[&_h4]:font-medium [&_h4]:uppercase [&_h4]:tracking-wide [&_h4]:mb-4 [&_h4]:text-foreground ' +
  "[&_h4]:![font-family:Georgia,Futura,'Helvetica_Neue',sans-serif] " +
  '[&_h4_a]:pointer-events-none [&_h4_a]:cursor-default [&_h4_a]:no-underline ' +
  '[&_h4_a]:text-inherit [&_h4_a]:hover:text-inherit ' +
  '[&_h1]:!text-base [&_h1]:!font-normal [&_h1]:!normal-case [&_h1]:!mb-6 [&_h1]:!mt-0 ' +
  '[&_h1]:!leading-relaxed [&_h1]:text-foreground ' +
  "[&_h1]:![font-family:Georgia,Futura,'Helvetica_Neue',sans-serif] " +
  '[&_h1_a]:pointer-events-none [&_h1_a]:cursor-default [&_h1_a]:no-underline [&_h1_a]:text-inherit'

const textAreaClasses =
  '[&>div+div]:mt-6 ' +
  headingClasses +
  ' ' +
  '[&_a]:text-muted-foreground [&_a:hover]:text-foreground [&_a:hover]:underline [&_a]:underline-offset-4 ' +
  '[&_a]:leading-loose ' +
  '[&_address]:not-italic [&_address]:text-muted-foreground [&_address]:leading-loose'

const inlineLinksClasses =
  headingClasses +
  ' ' +
  '[&_div]:leading-loose [&_div]:text-muted-foreground ' +
  '[&_a:hover]:text-foreground [&_a:hover]:underline [&_a]:underline-offset-4'

const Footer = async () => {
  const areas = await getFooter()
  const areaMap = Object.fromEntries(areas.map((a) => [a.id, a.html]))

  return (
    <footer>
      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {areaMap['widgetized-area-1'] && (
              <AboutArea html={areaMap['widgetized-area-1']} className={textAreaClasses} />
            )}

            {SOCIAL_LINKS.length > 0 && (
              <div>
                <h4
                  className="font-medium uppercase tracking-wide mb-4 text-foreground"
                  style={{
                    fontFamily: "Georgia, Futura, 'Helvetica Neue', sans-serif",
                  }}
                >
                  Соцсети
                </h4>
                <div className="flex gap-4">
                  {SOCIAL_LINKS.map(({ href, platform, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-button-link"
                      aria-label={platform}
                    >
                      <Icon aria-label={platform} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {areaMap['widgetized-area-3'] && (
              <div
                className={inlineLinksClasses}
                dangerouslySetInnerHTML={{
                  __html: areaMap['widgetized-area-3'],
                }}
              />
            )}

            {areaMap['widgetized-area-4'] && (
              <div
                className={inlineLinksClasses}
                dangerouslySetInnerHTML={{
                  __html: areaMap['widgetized-area-4'],
                }}
              />
            )}
          </div>
        </Container>

        <Container className="border-t not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center">
          <p className="text-muted-foreground">&copy; 2018–2026 Системный Блокъ</p>
        </Container>
      </Section>
    </footer>
  )
}

export default Footer

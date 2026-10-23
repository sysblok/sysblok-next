'use client'

import { siteConfig } from '@/site.config'

interface SharingProps {
  title: string
  slug: string
}

export function Sharing({ title, slug }: SharingProps) {
  const url = `${siteConfig.site_domain}/posts/${slug}`

  function share(shareUrl: string, width: number, height: number) {
    const left = window.innerWidth / 2 - width / 2
    const top = window.innerHeight / 2 - height / 2
    window.open(shareUrl, 'share', `width=${width},height=${height},top=${top},left=${left}`)
  }

  return (
    <div id="sharing">
      <ul className="sharing-list">
        <li>
          <button
            className="share-button icon-vkontakte"
            onClick={() =>
              share(
                `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
                650,
                584,
              )
            }
          />
        </li>
        <li>
          <button
            className="share-button icon-x-twitter"
            onClick={() =>
              share(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
                687,
                253,
              )
            }
          />
        </li>
      </ul>
    </div>
  )
}

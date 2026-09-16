import type { HTMLAttributes } from 'react'

export type IconProps = HTMLAttributes<HTMLElement> & {
  size?: number
}

function FontIcon({
  iconClass,
  size = 30,
  className = '',
  style,
  ...props
}: IconProps & { iconClass: string }) {
  return (
    <i
      className={`${iconClass} ${className}`.trim()}
      style={{ fontSize: size, lineHeight: 1, ...style }}
      {...props}
    />
  )
}

export function VkIcon(props: IconProps) {
  return <FontIcon iconClass="icon-vkontakte" {...props} />
}

export function XIcon(props: IconProps) {
  return <FontIcon iconClass="icon-x-twitter" {...props} />
}

export function TelegramIcon(props: IconProps) {
  return <FontIcon iconClass="icon-telegram" {...props} />
}

export function YoutubeIcon(props: IconProps) {
  return <FontIcon iconClass="icon-youtube" {...props} />
}

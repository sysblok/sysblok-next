import { TelegramIcon, VkIcon, XIcon, YoutubeIcon } from '@/components/icons/social-icons'

export const SOCIAL_LINKS = {
  telegram: {
    platform: 'telegram',
    href: 'https://t.me/sysblok',
    icon: TelegramIcon,
  },
  vk: {
    platform: 'vk',
    href: 'https://vk.com/sysblok',
    icon: VkIcon,
  },
  x: {
    platform: 'x',
    href: 'https://x.com/sysblok',
    icon: XIcon,
  },
  youtube: {
    platform: 'youtube',
    href: 'https://youtube.com/@sysblok',
    icon: YoutubeIcon,
  },
} as const

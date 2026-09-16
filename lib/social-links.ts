import { VkIcon, XIcon, TelegramIcon, YoutubeIcon } from '@/components/icons/social-icons'

export const SOCIAL_LINKS = [
  {
    platform: 'telegram',
    href: 'https://t.me/sysblok',
    icon: TelegramIcon,
  },
  {
    platform: 'vk',
    href: 'https://vk.com/sysblok',
    icon: VkIcon,
  },
  {
    platform: 'x',
    href: 'https://x.com/sysblok',
    icon: XIcon,
  },
  {
    platform: 'youtube',
    href: 'https://youtube.com/@sysblok',
    icon: YoutubeIcon,
  },
] as const

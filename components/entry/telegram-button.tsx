// Кнопка «Читать нас в Telegram» над постом (WP: components/telegram-button), видна только на мобильных
export function TelegramButton({ utmContent }: { utmContent: string }) {
  return (
    <a
      className="telegram-button"
      href={`https://t.me/sysblok?utm_content=${utmContent}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>Читать нас в Telegram</span>
    </a>
  )
}

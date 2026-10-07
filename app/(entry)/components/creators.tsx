import Link from 'next/link'
import type { Creator, Creators } from '@/lib/wordpress.d'

export function PostCreators({ creators }: { creators: Creators }) {
  const hasAny =
    creators.authors.length > 0 ||
    creators.editors.length > 0 ||
    creators.illustrators.length > 0 ||
    creators.curators.length > 0

  if (!hasAny) return null

  return (
    <div className="creators-post">
      {creators.authors.length > 0 && (
        <CreatorRow
          label={creators.authors.length > 1 ? 'Авторы' : 'Автор'}
          members={creators.authors}
        />
      )}
      {creators.editors.length > 0 && (
        <CreatorRow
          label={creators.editors.length > 1 ? 'Редакторы' : 'Редактор'}
          members={creators.editors}
        />
      )}
      {creators.illustrators.length > 0 && (
        <CreatorRow
          label={creators.illustrators.length > 1 ? 'Иллюстраторы' : 'Иллюстратор'}
          members={creators.illustrators}
        />
      )}
      {creators.curators.length > 0 && (
        <CreatorRow
          label={creators.curators.length > 1 ? 'Кураторы' : 'Куратор'}
          members={creators.curators}
        />
      )}
    </div>
  )
}

function CreatorRow({ label, members }: { label: string; members: Creator[] }) {
  return (
    <div className="creators-link">
      {label}:{' '}
      {members.map((member, i) => (
        <span key={member.link}>
          <Link href={member.link}>{member.name}</Link>
          {i < members.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
  )
}

import type { Tag } from '../../types'

interface Props {
  tag: Tag
  active?: boolean
  onClick?: () => void
  size?: 'sm' | 'xs'
}

export function TagPill({ tag, active, onClick, size = 'sm' }: Props) {
  const interactive = Boolean(onClick)
  const dims = size === 'xs' ? 'h-5 px-1.5 text-[10px]' : 'h-7 px-2.5 text-xs'
  const state = active
    ? 'border-accent bg-accent/10 text-accent-ink'
    : 'border-line text-ink-50'
  return (
    <span
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={`inline-flex select-none items-center rounded-full border font-medium lowercase tracking-wide transition ${dims} ${state} ${
        interactive ? 'cursor-pointer hover:border-ink/30' : ''
      }`}
    >
      {tag}
    </span>
  )
}

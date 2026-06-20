import type { MirrorMark } from './types'

export interface MarkRenderer {
  tag: string
  classes?: string
  extractHref?: (mark: MirrorMark) => string | undefined
}

const registry = new Map<string, MarkRenderer>()

function register(type: string, renderer: MarkRenderer): void {
  registry.set(type, renderer)
}

register('strong', { tag: 'strong' })
register('emphasis', { tag: 'em' })
register('code', { tag: 'code' })
register('subscript', { tag: 'sub' })
register('superscript', { tag: 'sup' })
register('underline', { tag: 'u' })
register('strike', { tag: 's' })
register('smallcap', { tag: 'span' })
register('link', { tag: 'a', extractHref: m => m.attrs?.target as string || m.attrs?.href as string })
register('xref', { tag: 'a', extractHref: m => m.attrs?.target as string })
register('eref', { tag: 'span' })
register('footnote', { tag: 'sup' })
register('stem', { tag: 'span' })
register('concept', { tag: 'span' })
register('bcp14', { tag: 'span' })
register('span', { tag: 'span' })

export { register as registerMark }

export function resolveMark(mark: MirrorMark): MarkRenderer | undefined {
  return registry.get(mark.type)
}

export function getMarkHref(mark: MirrorMark): string | undefined {
  const renderer = registry.get(mark.type)
  return renderer?.extractHref?.(mark)
}

export function resolveFirstMark(marks?: MirrorMark[]): { renderer: MarkRenderer; mark: MirrorMark } | null {
  if (!marks?.length) return null
  for (const mark of marks) {
    const renderer = registry.get(mark.type)
    if (renderer) return { renderer, mark }
  }
  return null
}

import type { MirrorMark } from './types'

export interface MarkRenderer {
  tag: string
  classes?: string
  priority?: number
  extractHref?: (mark: MirrorMark) => string | undefined
}

const registry = new Map<string, MarkRenderer>()

function register(type: string, renderer: MarkRenderer): void {
  registry.set(type, renderer)
}

const PRIORITY_LINK = 100
const PRIORITY_REFERENCE = 60
const PRIORITY_SEMANTIC = 50
const PRIORITY_FORMAT = 10

register('link', {
  tag: 'a',
  priority: PRIORITY_LINK,
  extractHref: m => {
    const target = m.attrs?.target
    if (typeof target === 'string') return target
    const href = m.attrs?.href
    return typeof href === 'string' ? href : undefined
  },
})
register('xref', {
  tag: 'a',
  priority: PRIORITY_LINK,
  extractHref: m => {
    const target = m.attrs?.target
    return typeof target === 'string' ? target : undefined
  },
})

register('footnote', { tag: 'sup', priority: PRIORITY_REFERENCE, classes: 'mirror-footnote' })
register('eref', { tag: 'span', priority: PRIORITY_REFERENCE, classes: 'mirror-eref' })

register('stem', { tag: 'span', priority: PRIORITY_SEMANTIC, classes: 'mirror-stem' })
register('concept', { tag: 'span', priority: PRIORITY_SEMANTIC, classes: 'mirror-concept' })
register('bcp14', { tag: 'span', priority: PRIORITY_SEMANTIC, classes: 'mirror-bcp14' })
register('smallcap', { tag: 'span', priority: PRIORITY_SEMANTIC, classes: 'mirror-smallcap' })

register('strong', { tag: 'strong', priority: PRIORITY_FORMAT })
register('emphasis', { tag: 'em', priority: PRIORITY_FORMAT })
register('code', { tag: 'code', priority: PRIORITY_FORMAT })
register('subscript', { tag: 'sub', priority: PRIORITY_FORMAT })
register('superscript', { tag: 'sup', priority: PRIORITY_FORMAT })
register('underline', { tag: 'u', priority: PRIORITY_FORMAT })
register('strike', { tag: 's', priority: PRIORITY_FORMAT })

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
  let best: { renderer: MarkRenderer; mark: MirrorMark } | null = null
  for (const mark of marks) {
    const renderer = registry.get(mark.type)
    if (!renderer) continue
    if (!best || (renderer.priority ?? 0) > (best.renderer.priority ?? 0)) {
      best = { renderer, mark }
    }
  }
  return best
}

import type { MirrorNode } from './types'
import { hasSectionType } from './types'

export function getNodeText(node: MirrorNode): string {
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(getNodeText).join('')
}

export function findNodes(
  node: MirrorNode,
  predicate: (n: MirrorNode) => boolean,
): MirrorNode[] {
  const results: MirrorNode[] = []
  walkForFind(node, predicate, results)
  return results
}

function walkForFind(
  node: MirrorNode,
  predicate: (n: MirrorNode) => boolean,
  results: MirrorNode[],
): void {
  if (predicate(node)) results.push(node)
  if (node.content) {
    for (const child of node.content) {
      walkForFind(child, predicate, results)
    }
  }
}

export interface TocEntry {
  id: string
  title: string
  depth: number
}

export function buildToc(root: MirrorNode): TocEntry[] {
  const entries: TocEntry[] = []
  walkForToc(root, 0, entries)
  return entries
}

function walkForToc(node: MirrorNode, depth: number, entries: TocEntry[]): void {
  if (hasSectionType(node)) {
    const attrs = node.attrs
    if (attrs?.title && attrs.id) {
      const number = attrs.number ? `${attrs.number} ` : ''
      entries.push({
        id: attrs.id,
        title: `${number}${attrs.title}`,
        depth,
      })
      if (node.content) {
        for (const child of node.content) {
          walkForToc(child, depth + 1, entries)
        }
      }
      return
    }
  }
  if (node.content) {
    for (const child of node.content) {
      walkForToc(child, depth, entries)
    }
  }
}

import type { MirrorNode } from './types'
import { SECTION_TYPES } from './types'

const sectionTypeSet = new Set<string>(SECTION_TYPES)

export function getNodeText(node: MirrorNode): string {
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(getNodeText).join('')
}

export function findNodes(
  node: MirrorNode,
  predicate: (n: MirrorNode) => boolean,
  results: MirrorNode[] = [],
): MirrorNode[] {
  if (predicate(node)) results.push(node)
  if (node.content) {
    for (const child of node.content) {
      findNodes(child, predicate, results)
    }
  }
  return results
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
  if (isTocSection(node) && node.attrs?.title && node.attrs?.id) {
    const number = node.attrs.number ? `${node.attrs.number} ` : ''
    entries.push({
      id: node.attrs.id as string,
      title: `${number}${node.attrs.title}`,
      depth,
    })
    if (node.content) {
      for (const child of node.content) {
        walkForToc(child, depth + 1, entries)
      }
    }
    return
  }
  if (node.content) {
    for (const child of node.content) {
      walkForToc(child, depth, entries)
    }
  }
}

function isTocSection(node: MirrorNode): boolean {
  return sectionTypeSet.has(node.type)
}

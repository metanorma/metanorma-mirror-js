import { hasType, type MirrorNode } from './types'

export interface FormulaDisplay {
  mathml: string | null
  asciimath: string | null
  number: string | null
}

export function extractFormulaAttrs(node: MirrorNode): FormulaDisplay {
  if (!hasType(node, 'formula')) {
    return { mathml: null, asciimath: null, number: null }
  }
  const attrs = node.attrs
  return {
    mathml: attrs?.mathml || null,
    asciimath: attrs?.asciimath || attrs?.math_text || null,
    number: attrs?.number || null,
  }
}

export async function renderFormula(node: MirrorNode): Promise<string> {
  const { mathml, asciimath } = extractFormulaAttrs(node)

  if (mathml) return mathml

  if (asciimath) {
    try {
      const { default: Plurimath } = await import('@plurimath/plurimath')
      const p = new Plurimath(asciimath, 'asciimath')
      return p.toMathml()
    } catch {
      return asciimath
    }
  }

  return ''
}

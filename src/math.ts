import type { MirrorNode } from './types'

export interface FormulaDisplay {
  mathml: string | null
  asciimath: string | null
  number: string | null
}

export function extractFormulaAttrs(node: MirrorNode): FormulaDisplay {
  const attrs = node.attrs ?? {}
  return {
    mathml: (attrs.mathml as string) || null,
    asciimath: (attrs.asciimath as string) || (attrs.math_text as string) || null,
    number: (attrs.number as string) || null,
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

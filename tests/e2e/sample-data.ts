import type { MirrorDocument } from '../../src/types'

export const sampleDocument: MirrorDocument = {
  type: 'doc',
  attrs: {
    flavor: 'iso',
    type: 'presentation',
    title: 'Sample Mirror Document',
  },
  content: [
    {
      type: 'sections',
      content: [
        {
          type: 'clause',
          attrs: { id: 'scope', title: 'Scope', number: '1' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'This document specifies ' },
                { type: 'text', text: 'metrological requirements', marks: [{ type: 'strong' }] },
                { type: 'text', text: ' for measuring instruments.' },
              ],
            },
            {
              type: 'note',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Notes provide supplementary information about the requirements.' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'clause',
          attrs: { id: 'terms', title: 'Terms and definitions', number: '2' },
          content: [
            {
              type: 'dl',
              content: [
                {
                  type: 'dt',
                  content: [{ type: 'text', text: 'maximum permissible error' }],
                },
                {
                  type: 'dd',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'The largest error of a measuring instrument, ' },
                        { type: 'text', text: 'MPE', marks: [{ type: 'stem' }] },
                        { type: 'text', text: ', permitted by regulation.' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'clause',
          attrs: { id: 'tables', title: 'Test results', number: '3' },
          content: [
            {
              type: 'table',
              attrs: { title: 'MPE values by load', number: 'Table 1' },
              content: [
                {
                  type: 'table_head',
                  content: [
                    {
                      type: 'table_row',
                      content: [
                        { type: 'table_cell', content: [{ type: 'text', text: 'Load (kg)' }] },
                        { type: 'table_cell', content: [{ type: 'text', text: 'MPE (mg)' }] },
                      ],
                    },
                  ],
                },
                {
                  type: 'table_body',
                  content: [
                    {
                      type: 'table_row',
                      content: [
                        { type: 'table_cell', content: [{ type: 'text', text: '0 – 500' }] },
                        { type: 'table_cell', content: [{ type: 'text', text: '±0.5' }] },
                      ],
                    },
                    {
                      type: 'table_row',
                      content: [
                        { type: 'table_cell', content: [{ type: 'text', text: '500 – 2000' }] },
                        { type: 'table_cell', content: [{ type: 'text', text: '±1.0' }] },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'The maximum permissible error is given by ' },
              ],
            },
            {
              type: 'formula',
              attrs: {
                mathml: '<math><mrow><mi>MPE</mi><mo>=</mo><mn>0.5</mn><mi>mg</mi></mrow></math>',
                number: '1',
              },
            },
          ],
        },
        {
          type: 'clause',
          attrs: { id: 'marks', title: 'Inline formatting', number: '4' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Text with ' },
                { type: 'text', text: 'emphasis', marks: [{ type: 'emphasis' }] },
                { type: 'text', text: ', ' },
                { type: 'text', text: 'code', marks: [{ type: 'code' }] },
                { type: 'text', text: ', ' },
                { type: 'text', text: 'H', marks: [] },
                { type: 'text', text: '2', marks: [{ type: 'subscript' }] },
                { type: 'text', text: 'O, ' },
                { type: 'text', text: 'x²', marks: [{ type: 'superscript' }] },
                { type: 'text', text: ', ' },
                { type: 'text', text: 'a link', marks: [{ type: 'link', attrs: { target: 'https://example.com' } }] },
                { type: 'text', text: ', ' },
                { type: 'text', text: '§3.2', marks: [{ type: 'xref', attrs: { target: '#tables' } }] },
                { type: 'text', text: ', and ' },
                { type: 'text', text: '1', marks: [{ type: 'footnote', attrs: { id: 'fn1' } }] },
                { type: 'text', text: '.' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

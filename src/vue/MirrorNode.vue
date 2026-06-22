<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../types'
import { isSectionType } from '../types'
import { extractFormulaAttrs } from '../math'
import MirrorText from './MirrorText.vue'

defineOptions({ name: 'MirrorNode' })
const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

function headingTag(depth: number): string {
  return 'h' + Math.min(depth + 1, 6)
}

const formula = computed(() => (props.node.type === 'formula' ? extractFormulaAttrs(props.node) : null))
</script>

<template>
  <!-- Text node -->
  <template v-if="node.type === 'text'">
    <MirrorText :text="node.text ?? ''" :marks="node.marks" />
  </template>

  <!-- Document root -->
  <article v-else-if="node.type === 'doc'" class="mirror-doc">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth ?? 0" />
  </article>

  <!-- Structural containers -->
  <div v-else-if="node.type === 'preface'" class="mirror-preface">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="(depth ?? 0) + 1" />
  </div>
  <div v-else-if="node.type === 'sections'" class="mirror-sections">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="(depth ?? 0) + 1" />
  </div>
  <div v-else-if="node.type === 'bibliography'" class="mirror-bibliography">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="(depth ?? 0) + 1" />
  </div>

  <!-- Sections -->
  <section v-else-if="isSectionType(node.type)" :id="(node.attrs?.id as string) || undefined" class="mirror-section" :class="'mirror-' + node.type">
    <component :is="headingTag(depth ?? 1)" v-if="node.attrs?.title" class="mirror-heading">
      <span v-if="node.attrs?.number" class="mirror-number">{{ node.attrs.number }}&nbsp;</span>{{ node.attrs.title }}
    </component>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="(depth ?? 1) + 1" />
  </section>

  <!-- Paragraph -->
  <p v-else-if="node.type === 'paragraph'" class="mirror-paragraph">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" />
  </p>

  <!-- Note -->
  <div v-else-if="node.type === 'note'" class="mirror-note">
    <div class="mirror-note-label">Note</div>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>

  <!-- Admonition -->
  <div v-else-if="node.type === 'admonition'" class="mirror-admonition" :data-admonition-type="node.attrs?.type || 'note'">
    <div v-if="node.attrs?.type" class="mirror-admonition-label">{{ node.attrs.type }}</div>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>

  <!-- Example -->
  <div v-else-if="node.type === 'example'" class="mirror-example">
    <div class="mirror-example-label">Example</div>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>

  <!-- Quote -->
  <blockquote v-else-if="node.type === 'quote'" class="mirror-quote">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </blockquote>

  <!-- Review -->
  <div v-else-if="node.type === 'review'" class="mirror-review">
    <div class="mirror-review-label">Review</div>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>

  <!-- Figure -->
  <figure v-else-if="node.type === 'figure'" class="mirror-figure">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
    <figcaption v-if="node.attrs?.title" class="mirror-figure-caption">
      <span v-if="node.attrs?.number" class="mirror-number">{{ node.attrs.number }}&nbsp;</span>{{ node.attrs.title }}
    </figcaption>
  </figure>

  <!-- Image -->
  <div v-else-if="node.type === 'image'" class="mirror-image">
    <img v-if="node.attrs?.src" :src="node.attrs.src as string" :alt="(node.attrs?.alt as string) || ''">
  </div>

  <!-- Table -->
  <div v-else-if="node.type === 'table'" class="mirror-table">
    <div v-if="node.attrs?.title" class="mirror-table-title">
      <span v-if="node.attrs?.number" class="mirror-number">{{ node.attrs.number }}&nbsp;</span>{{ node.attrs.title }}
    </div>
    <table>
      <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
    </table>
  </div>

  <thead v-else-if="node.type === 'table_head'">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </thead>
  <tbody v-else-if="node.type === 'table_body'">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </tbody>
  <tfoot v-else-if="node.type === 'table_foot'">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </tfoot>
  <tr v-else-if="node.type === 'table_row'">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </tr>
  <td v-else-if="node.type === 'table_cell'"
    :colspan="(node.attrs?.colspan as number) || undefined"
    :rowspan="(node.attrs?.rowspan as number) || undefined"
  >
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </td>

  <!-- Formula -->
  <div v-else-if="node.type === 'formula'" class="mirror-formula">
    <!-- eslint-disable-next-line vue/no-v-html -- MathML is trusted pre-computed output -->
    <div v-if="formula?.mathml" class="mirror-formula-content" v-html="formula.mathml" />
    <span v-else-if="formula?.asciimath" class="mirror-formula-content">{{ formula.asciimath }}</span>
    <span v-if="formula?.number" class="mirror-formula-number">({{ formula.number }})</span>
  </div>

  <!-- Sourcecode -->
  <pre v-else-if="node.type === 'sourcecode'" class="mirror-sourcecode"><code>{{ node.attrs?.text }}</code></pre>

  <!-- Lists -->
  <ul v-else-if="node.type === 'bullet_list'" class="mirror-bullet-list">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </ul>
  <ol v-else-if="node.type === 'ordered_list'" class="mirror-ordered-list">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </ol>
  <li v-else-if="node.type === 'list_item'" class="mirror-list-item">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </li>
  <dl v-else-if="node.type === 'dl'" class="mirror-dl">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </dl>
  <dt v-else-if="node.type === 'dt'" class="mirror-dt">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </dt>
  <dd v-else-if="node.type === 'dd'" class="mirror-dd">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </dd>

  <!-- Footnotes -->
  <div v-else-if="node.type === 'footnotes'" class="mirror-footnotes">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>
  <div v-else-if="node.type === 'footnote_entry'" class="mirror-footnote-entry">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>

  <!-- Floating title -->
  <component :is="headingTag((depth ?? 2) + 1)" v-else-if="node.type === 'floating_title'" class="mirror-floating-title">{{ node.attrs?.title }}</component>

  <!-- Soft break -->
  <br v-else-if="node.type === 'soft_break'">

  <!-- Fallback: render children -->
  <div v-else-if="node.content?.length" :class="'mirror-' + node.type">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>
</template>

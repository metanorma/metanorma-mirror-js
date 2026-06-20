<script setup lang="ts">
import type { MirrorMark } from '../types'
import { getMarkHref } from '../marks'

const props = defineProps<{ text: string; marks?: MirrorMark[] }>()

function hasMark(type: string): boolean {
  return !!props.marks?.some(m => m.type === type)
}

function getHref(): string | undefined {
  if (!props.marks) return undefined
  const link = props.marks.find(m => m.type === 'link')
  const xref = props.marks.find(m => m.type === 'xref')
  return getMarkHref(link || xref!)
}
</script>

<template>
  <template v-if="!marks?.length">{{ text }}</template>

  <a v-else-if="hasMark('link') || hasMark('xref')" :href="getHref()">{{ text }}</a>

  <strong v-else-if="hasMark('strong')">{{ text }}</strong>
  <em v-else-if="hasMark('emphasis')">{{ text }}</em>
  <code v-else-if="hasMark('code')">{{ text }}</code>
  <sub v-else-if="hasMark('subscript')">{{ text }}</sub>
  <sup v-else-if="hasMark('superscript')">{{ text }}</sup>
  <u v-else-if="hasMark('underline')">{{ text }}</u>
  <s v-else-if="hasMark('strike')">{{ text }}</s>
  <span v-else-if="hasMark('smallcap')" class="mirror-smallcap">{{ text }}</span>
  <span v-else-if="hasMark('stem')" class="mirror-stem">{{ text }}</span>
  <sup v-else-if="hasMark('footnote')" class="mirror-footnote">{{ text }}</sup>
  <span v-else-if="hasMark('concept')" class="mirror-concept">{{ text }}</span>
  <span v-else-if="hasMark('bcp14')" class="mirror-bcp14">{{ text }}</span>
  <span v-else-if="hasMark('eref')" class="mirror-eref">{{ text }}</span>
  <span v-else>{{ text }}</span>
</template>

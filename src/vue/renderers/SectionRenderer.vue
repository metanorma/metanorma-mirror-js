<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasSectionType, type SectionAttrs } from '../../types'
import MirrorNode from '../MirrorNode.vue'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<SectionAttrs | undefined>(() =>
  hasSectionType(props.node) ? props.node.attrs : undefined,
)

function headingTag(depth: number): string {
  return 'h' + Math.min(depth + 1, 6)
}

const headingLevel = computed(() => headingTag(props.depth ?? 1))
</script>

<template>
  <section :id="attrs?.id" class="mirror-section" :class="'mirror-' + node.type">
    <component :is="headingLevel" v-if="attrs?.title" class="mirror-heading">
      <span v-if="attrs?.number" class="mirror-number">{{ attrs.number }}&nbsp;</span>{{ attrs.title }}
    </component>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="(depth ?? 1) + 1" />
  </section>
</template>

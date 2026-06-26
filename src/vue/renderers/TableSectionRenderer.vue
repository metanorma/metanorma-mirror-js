<script setup lang="ts">
import type { MirrorNode as MirrorNodeType } from '../../types'
import MirrorNode from '../MirrorNode.vue'

defineProps<{ node: MirrorNodeType; depth?: number }>()

const TAGS: Record<string, string> = {
  table_head: 'thead',
  table_body: 'tbody',
  table_foot: 'tfoot',
}
</script>

<template>
  <component :is="TAGS[node.type]">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </component>
</template>

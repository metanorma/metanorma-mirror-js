<script setup lang="ts">
import type { MirrorNode as MirrorNodeType } from '../../types'
import MirrorNode from '../MirrorNode.vue'

defineProps<{ node: MirrorNodeType; depth?: number }>()

const LABELS: Record<string, string> = {
  note: 'Note',
  example: 'Example',
  review: 'Review',
}
</script>

<template>
  <div :class="'mirror-' + node.type">
    <div :class="`mirror-${node.type}-label`">{{ LABELS[node.type] }}</div>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>
</template>

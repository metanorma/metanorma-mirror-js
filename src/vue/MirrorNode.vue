<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../types'
import { resolveNodeRenderer } from './registry'

defineOptions({ name: 'MirrorNode' })
const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const resolved = computed(() => resolveNodeRenderer(props.node.type))
</script>

<template>
  <component :is="resolved" v-if="resolved" :node="node" :depth="depth" />
  <div v-else-if="node.content?.length" :class="'mirror-' + node.type">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>
</template>

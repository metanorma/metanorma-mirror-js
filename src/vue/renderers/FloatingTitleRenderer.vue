<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

function headingTag(depth: number): string {
  return 'h' + Math.min(depth + 1, 6)
}

const tag = computed(() => headingTag((props.depth ?? 2) + 1))
const title = computed(() => props.node.attrs?.title)
</script>

<template>
  <component :is="tag" class="mirror-floating-title">{{ title }}</component>
</template>

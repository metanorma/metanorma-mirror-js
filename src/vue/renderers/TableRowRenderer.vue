<script setup lang="ts">
import type { MirrorNode as MirrorNodeType } from '../../types'
import MirrorNode from '../MirrorNode.vue'

defineProps<{ node: MirrorNodeType; depth?: number }>()
</script>

<template>
  <tr>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </tr>
</template>

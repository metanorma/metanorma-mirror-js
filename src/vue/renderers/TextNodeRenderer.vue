<script setup lang="ts">
import type { MirrorNode as MirrorNodeType } from '../../types'
import MirrorText from '../MirrorText.vue'

defineProps<{ node: MirrorNodeType; depth?: number }>()
</script>

<template>
  <MirrorText :text="node.text ?? ''" :marks="node.marks" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasType, type AdmonitionAttrs } from '../../types'
import MirrorNode from '../MirrorNode.vue'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<AdmonitionAttrs | undefined>(() =>
  hasType(props.node, 'admonition') ? props.node.attrs : undefined,
)
const admonitionType = computed(() => {
  const t = attrs.value?.type
  return typeof t === 'string' && t ? t : 'note'
})
</script>

<template>
  <div class="mirror-admonition" :data-admonition-type="admonitionType">
    <div v-if="attrs?.type" class="mirror-admonition-label">{{ attrs.type }}</div>
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </div>
</template>

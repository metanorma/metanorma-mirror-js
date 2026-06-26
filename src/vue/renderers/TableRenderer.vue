<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasType, type TableAttrs } from '../../types'
import MirrorNode from '../MirrorNode.vue'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<TableAttrs | undefined>(() =>
  hasType(props.node, 'table') ? props.node.attrs : undefined,
)
</script>

<template>
  <div class="mirror-table">
    <div v-if="attrs?.title" class="mirror-table-title">
      <span v-if="attrs?.number" class="mirror-number">{{ attrs.number }}&nbsp;</span>{{ attrs.title }}
    </div>
    <table>
      <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
    </table>
  </div>
</template>

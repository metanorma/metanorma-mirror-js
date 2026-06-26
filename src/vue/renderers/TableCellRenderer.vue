<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasType, type TableCellAttrs } from '../../types'
import MirrorNode from '../MirrorNode.vue'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<TableCellAttrs | undefined>(() =>
  hasType(props.node, 'table_cell') ? props.node.attrs : undefined,
)
const colspan = computed(() => attrs.value?.colspan)
const rowspan = computed(() => attrs.value?.rowspan)
</script>

<template>
  <td :colspan="colspan" :rowspan="rowspan">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
  </td>
</template>

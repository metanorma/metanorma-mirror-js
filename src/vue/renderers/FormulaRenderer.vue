<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasType, type FormulaAttrs } from '../../types'
import { renderFormula } from '../../math'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<FormulaAttrs | undefined>(() =>
  hasType(props.node, 'formula') ? props.node.attrs : undefined,
)
const number = computed(() => attrs.value?.number || null)
const display = ref('')

let token = 0
watch(
  () => props.node,
  async (node) => {
    const mine = ++token
    const rendered = await renderFormula(node)
    if (mine === token) display.value = rendered
  },
  { immediate: true },
)
</script>

<template>
  <div class="mirror-formula">
    <!-- eslint-disable-next-line vue/no-v-html -- MathML is trusted pre-computed output -->
    <div v-if="display" class="mirror-formula-content" v-html="display" />
    <span v-if="number" class="mirror-formula-number">({{ number }})</span>
  </div>
</template>

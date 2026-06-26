<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasType, type FormulaAttrs } from '../../types'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<FormulaAttrs | undefined>(() =>
  hasType(props.node, 'formula') ? props.node.attrs : undefined,
)
const mathml = computed(() => attrs.value?.mathml || null)
const asciimath = computed(() => attrs.value?.asciimath || attrs.value?.math_text || null)
const number = computed(() => attrs.value?.number || null)
</script>

<template>
  <div class="mirror-formula">
    <!-- eslint-disable-next-line vue/no-v-html -- MathML is trusted pre-computed output -->
    <div v-if="mathml" class="mirror-formula-content" v-html="mathml" />
    <span v-else-if="asciimath" class="mirror-formula-content">{{ asciimath }}</span>
    <span v-if="number" class="mirror-formula-number">({{ number }})</span>
  </div>
</template>

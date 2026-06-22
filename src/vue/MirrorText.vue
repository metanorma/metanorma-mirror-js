<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorMark } from '../types'
import { resolveFirstMark, getMarkHref } from '../marks'

const props = defineProps<{ text: string; marks?: MirrorMark[] }>()

const resolved = computed(() => resolveFirstMark(props.marks))
const href = computed(() => (resolved.value ? getMarkHref(resolved.value.mark) : undefined))
</script>

<template>
  <template v-if="!resolved">{{ text }}</template>
  <component
    :is="resolved.renderer.tag"
    v-else
    :href="href"
    :class="resolved.renderer.classes"
  >{{ text }}</component>
</template>

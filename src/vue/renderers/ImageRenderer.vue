<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasType, type ImageAttrs } from '../../types'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<ImageAttrs | undefined>(() =>
  hasType(props.node, 'image') ? props.node.attrs : undefined,
)
const src = computed(() => attrs.value?.src)
const alt = computed(() => attrs.value?.alt ?? '')
</script>

<template>
  <div class="mirror-image">
    <img v-if="src" :src="src" :alt="alt">
  </div>
</template>

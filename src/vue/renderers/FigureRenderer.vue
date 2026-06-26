<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasType, type FigureAttrs } from '../../types'
import MirrorNode from '../MirrorNode.vue'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<FigureAttrs | undefined>(() =>
  hasType(props.node, 'figure') ? props.node.attrs : undefined,
)
</script>

<template>
  <figure class="mirror-figure">
    <MirrorNode v-for="(child, i) in node.content" :key="i" :node="child" :depth="depth" />
    <figcaption v-if="attrs?.title" class="mirror-figure-caption">
      <span v-if="attrs?.number" class="mirror-number">{{ attrs.number }}&nbsp;</span>{{ attrs.title }}
    </figcaption>
  </figure>
</template>

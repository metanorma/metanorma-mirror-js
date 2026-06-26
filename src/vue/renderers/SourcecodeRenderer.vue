<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorNode as MirrorNodeType } from '../../types'
import { hasType, type SourcecodeAttrs } from '../../types'

const props = defineProps<{ node: MirrorNodeType; depth?: number }>()

const attrs = computed<SourcecodeAttrs | undefined>(() =>
  hasType(props.node, 'sourcecode') ? props.node.attrs : undefined,
)
const text = computed(() => attrs.value?.text)
</script>

<template>
  <pre class="mirror-sourcecode"><code>{{ text }}</code></pre>
</template>

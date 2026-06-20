<script setup lang="ts">
import { ref } from 'vue'
import { MirrorNode } from '../../src/vue'
import { sampleDocument } from './sample-data'

const doc = ref(sampleDocument)
</script>

<template>
  <div id="test-container">
    <MirrorNode :node="doc" :depth="0" />
  </div>
</template>


<template>
  <TresCanvas
    clear-color="#82DBC5"
    window-size
    
  >
    <TresPerspectiveCamera
      :position="[3, 1, 3]"
      :look-at="[0, 0, 0]"
    />

    <OrbitControls />
    <TresMesh>
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshBasicMaterial color="orange" />
    </TresMesh>
    <TresAmbientLight :intensity="1" />
    <KeyboardControls />
    <Grid
      :args="[10.5, 10.5]"
      cell-color="#000000"
      :cell-size="0.6"
      :cell-thickness="0.5"
      section-color="#fbb03b"
      :section-size="2"
      :section-thickness="1.3"
      :infinite-grid="true"
      :fade-from="0"
      :fade-distance="12"
      :fade-strength="1"
    />

  </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import OrbitControls from './components/OrbitControls.vue'
import { KeyboardControls, Grid, Lensflare } from '@tresjs/cientos'


</script>

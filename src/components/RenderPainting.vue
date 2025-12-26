<script setup lang="ts">
import { Config } from "@/config";

interface Props {
  paintingId: string;
}
const props = defineProps<Props>();
</script>

<template>
  <img class="player-painting" :src="`${Config.APIURL}/api/paintings/${paintingId}/render`"
    onerror="this.src='/missing-image.svg';this.title='Painting not found'" />
</template>

<style lang="css" scoped>
.player-painting {
  image-rendering: pixelated;
  width: 100%;
  height: 100%;
  object-fit: contain;
  overflow: hidden;
}
</style>

<script setup lang="ts">
import { Config } from "@/config";

interface Props {
  paintingId: string,
  size: string
}
defineProps<Props>()

</script>

<template>
  <div class="painting-wrapper flex justify-center items-center">
    <img :class="[size.toLowerCase()]" :src="`${Config.APIURL}/api/paintings/${paintingId}/render`" />
  </div>
</template>

<style lang="css" scoped>
.painting-wrapper {
  width: 256px;
  height: 256px;
}

.painting-wrapper img {
  image-rendering: pixelated;
  width: 100%;
  height: 100%;
}

.painting-wrapper img.tall {
  width: 50%;
}

.painting-wrapper img.wide {
  height: 50%;
}
</style>

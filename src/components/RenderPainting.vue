<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";

interface Props {
  painting: Painting | null
}
defineProps<Props>()

function toRGBA(num: number) {
  num >>>= 0;
  var b = num & 0xff,
    g = (num & 0xff00) >>> 8,
    r = (num & 0xff0000) >>> 16,
    a = (num & 0xff000000) >>> 24;
  return [r, g, b, a];
}

function renderPainting(canvas: Element | any, painting: Painting) {
  if (canvas == null) return; // When the page is unloaded

  console.log(`Rendering painting ${painting.id}`);

  let imageSize = painting.size.toLowerCase(); // Large, Tall, Wide, Small
  // Small: 16x16, Large: 32x32, Tall: 16x32, Wide/Long: 32x16
  let width = imageSize == "large" || imageSize == "wide" ? 32 : 16;
  let height = imageSize == "large" || imageSize == "tall" ? 32 : 16;

  canvas.width = width;
  canvas.height = height;

  let ctx = canvas.getContext("2d");
  let canvasImageData = ctx.createImageData(width, height);

  let imageData = painting.data.split(",");

  for (let i = 0; i < imageData.length; i++) {
    let rgba = toRGBA(Number(imageData[i]));

    // Modify pixel data
    let index = i * 4;
    canvasImageData.data[index + 0] = rgba[0]; // R value
    canvasImageData.data[index + 1] = rgba[1]; // G value
    canvasImageData.data[index + 2] = rgba[2]; // B value
    canvasImageData.data[index + 3] = rgba[3]; // A value
  }

  ctx.putImageData(canvasImageData, 0, 0);
}
</script>

<template>
  <div class="painting-wrapper flex justify-center items-center" v-if="painting != null">
    <canvas :class="[painting.size.toLowerCase()]" :ref="(el) => renderPainting(el, painting!)"></canvas>
  </div>
</template>

<style lang="css" scoped>
.painting-wrapper {
  width: 256px;
  height: 256px;
}

.painting-wrapper canvas {
  image-rendering: pixelated;
  width: 100%;
  height: 100%;
}

.painting-wrapper canvas.tall {
  width: 50%;
}

.painting-wrapper canvas.wide {
  height: 50%;
}
</style>

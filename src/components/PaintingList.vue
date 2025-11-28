<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import RenderPainting from "./RenderPainting.vue";
import { onMounted, onUpdated, ref } from "vue";
import { Config } from "@/config";
import MultiCanvasPaintingEditor, { type SavedMultiCanvasPainting } from "./MultiCanvasPaintingEditor.vue";
import { initFlowbite } from "flowbite";

interface Props {
  paintings: Painting[];
}
const props = defineProps<Props>();

const selectedPaintings = ref([] as Painting[]);
const savedMultiCanvasPaintings = ref([] as SavedMultiCanvasPainting[]);

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});
</script>

<template>
  <div>
    <div class="flex flex-row flex-wrap w-full gap-4 justify-center">
      <div v-for="painting in paintings" class="flex justify-center items-center flex-col gap-2 mb-4">
        <!-- Title -->
        <div class="w-full text-center pl-1">
          <div>
            <RouterLink :to="{ name: 'painting', params: { id: painting.id } }" class="hyperlink">
              {{ painting.title }}
            </RouterLink>
          </div>
        </div>

        <!-- Collection editor -->
        <div v-if="Config.FEATURE_MULTICANVAS_EDITOR" class="relative h-[256px] w-[256px]">
          <input
            type="checkbox"
            name="painting-select"
            :id="`painting-select-${painting.id}`"
            :value="painting"
            v-model="selectedPaintings"
            class="hidden peer"
            :disabled="painting.isMultiCanvas" />
          <label
            :for="`painting-select-${painting.id}`"
            class="h-[256px] w-[256px] inline-flex items-center justify-between p-2 text-body bg-neutral-primary-soft border-1 border-default rounded-base cursor-pointer peer-checked:hover:bg-brand-softer peer-checked:border-brand-subtle peer-checked:bg-brand-softer hover:bg-neutral-secondary-medium peer-checked:text-fg-brand-strong">
            <RenderPainting :painting-id="painting.id"></RenderPainting>
          </label>

          <div class="absolute left-0 bottom-0 bg-gray-950/60 text-xs" v-if="painting.isMultiCanvas">Multi-canvas</div>
        </div>

        <!-- Normal render -->
        <div v-else class="h-[256px] w-[256px]">
          <RenderPainting :painting-id="painting.id"></RenderPainting>
        </div>

        <!-- Artist -->
        <div class="w-full text-center pl-1">
          <div class="text-sm text-gray-300">
            <span>By </span>
            <RouterLink :to="{ name: 'gallery', params: { authorName: painting.authorName } }" class="hyperlink">
              {{ painting.authorName }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <MultiCanvasPaintingEditor
      v-if="Config.FEATURE_MULTICANVAS_EDITOR && selectedPaintings.length > 0"
      :canvases="selectedPaintings"
      @painting-created="(painting) => savedMultiCanvasPaintings.push(painting)"
      @clear="selectedPaintings.splice(0)"></MultiCanvasPaintingEditor>

    <!-- Success toast -->
    <div
      v-for="collection in savedMultiCanvasPaintings"
      :id="`toast-success-${collection.id}`"
      class="flex justify-center items-center fixed z-100 bottom-5 right-5 p-3 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default"
      role="alert">
      <!-- Icon -->
      <div class="inline-flex items-center justify-center shrink-0 w-7 h-7 text-fg-success bg-success-soft rounded">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
        </svg>
        <span class="sr-only">Check icon</span>
      </div>

      <!-- Text -->
      <div class="ms-3 text-sm font-normal">
        Saved '{{ collection.title }}' by '{{ collection.author }}' with {{ collection.numPaintings }} paintings
      </div>

      <!-- Close -->
      <button
        type="button"
        class="ms-auto flex items-center justify-center text-body hover:text-heading bg-transparent box-border border border-transparent hover:bg-neutral-secondary-medium focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded text-sm h-8 w-8 focus:outline-none"
        :data-dismiss-target="`#toast-success-${collection.id}`"
        aria-label="Close">
        <span class="sr-only">Close</span>
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
        </svg>
      </button>
    </div>
  </div>
</template>

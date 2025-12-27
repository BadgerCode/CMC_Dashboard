<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import RenderPainting from "./RenderPainting.vue";
import { onMounted, onUpdated, ref, watch } from "vue";
import { Config } from "@/config";
import MultiCanvasPaintingEditor, { type SavedMultiCanvasPainting } from "./MultiCanvasPaintingEditor.vue";
import { initFlowbite } from "flowbite";
import FavouritePainting from "./FavouritePainting.vue";

interface Props {
  paintings: Painting[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "reload"): void;
}>();


// Multi-canvas stuff
const selectedPaintings = ref([] as Painting[]);
const savedMultiCanvasPaintings = ref([] as SavedMultiCanvasPainting[]);
watch(props.paintings, () => {
  selectedPaintings.value.splice(0);
});

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

async function splitMultiPartPainting(painting: Painting) {
  if (!confirm(`Are you sure you want to split apart the painting '${painting.title}' by '${painting.authorName}'?`)) return;

  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-Functions-Key", Config.MULTICANVAS_EDITOR_KEY!);

  let httpResponse = await fetch(`${Config.APIURL}/api/multicanvaspaintings/${painting.id}`, {
    method: "delete",
    headers: requestHeaders,
  });

  if (httpResponse.status !== 200) {
    // TODO: show error toast
    alert("Failed to split apart multi-canvas painting");
    throw new Error("Failed to split apart multi-canvas painting");
  }

  emit('reload');
}
</script>

<template>
  <div>
    <div class="flex flex-row flex-wrap w-full gap-6 justify-center">
      <div v-for="painting in paintings" class="flex justify-center items-center flex-col gap-1 mb-4">
        <!-- Title -->
        <div class="w-full text-center pl-1">
          <div>
            <RouterLink :to="{ name: 'painting', params: { id: painting.id } }" class="hyperlink">
              {{ painting.title }}
            </RouterLink>
          </div>
        </div>

        <!-- Multi-canvas editor -->
        <div v-if="Config.FEATURE_MULTICANVAS_EDITOR" class="relative h-[256px] w-[256px]">
          <!-- Hidden selection checkbox -->
          <input type="checkbox" name="painting-select" :id="`painting-select-${painting.id}`" :value="painting"
            v-model="selectedPaintings" class="hidden peer" :disabled="painting.isMultiCanvas" />

          <!-- Selectable painting image -->
          <label :for="`painting-select-${painting.id}`"
            class="h-[256px] w-[256px] inline-flex items-center justify-between p-2 text-body bg-neutral-primary-soft border-1 border-default rounded-base cursor-pointer peer-checked:hover:bg-brand-softer peer-checked:border-brand-subtle peer-checked:bg-brand-softer hover:bg-neutral-secondary-medium peer-checked:text-fg-brand-strong">
            <RenderPainting :painting-id="painting.id"></RenderPainting>
          </label>

          <!-- Multi-canvas label  -->
          <div class="absolute left-0 bottom-0 bg-gray-950/60 text-xs" v-if="painting.isMultiCanvas">Multi-canvas</div>

          <!-- Split multi-canvas -->
          <div class="absolute right-0 bottom-0 text-xs" v-if="painting.isMultiCanvas">
            <button type="button" class="button-icon-only" aria-label="Split" @click="splitMultiPartPainting(painting)">
              <span class="sr-only">Split</span>
              <font-awesome-icon icon="fa-solid fa-link-slash" />
            </button>
          </div>
        </div>

        <!-- Normal render -->
        <div v-else class="relative h-[256px] w-[256px]">
          <RenderPainting :painting-id="painting.id"></RenderPainting>
        </div>

        <!-- Artist -->
        <div class="w-full flex flex-row justify-between items-center px-2">
          <div class="text-sm text-gray-300">
            <span>By </span>
            <RouterLink :to="{ name: 'gallery', params: { authorName: painting.authorName } }" class="hyperlink">
              {{ painting.authorName }}
            </RouterLink>
          </div>

          <div class="text-s">
            <FavouritePainting :painting-id="painting.id" :title="painting.title" :author="painting.authorName" v-if="Config.FEATURE_FAVOURITE_PAINTINGS">
            </FavouritePainting>
          </div>
        </div>
      </div>
    </div>

    <!-- Multi canvas editor -->
    <MultiCanvasPaintingEditor v-if="Config.FEATURE_MULTICANVAS_EDITOR && selectedPaintings.length > 0"
      :canvases="selectedPaintings"
      @painting-created="(painting) => { savedMultiCanvasPaintings.push(painting); emit('reload'); selectedPaintings.splice(0); }"
      @select-all="selectedPaintings = paintings.slice()" @clear="selectedPaintings.splice(0)"
      @reload="$emit('reload')"></MultiCanvasPaintingEditor>

    <!-- Success toast -->
    <div v-for="painting in savedMultiCanvasPaintings" :id="`toast-success-${painting.id}`"
      class="flex justify-center items-center fixed z-100 bottom-5 right-5 p-3 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default gap-2"
      role="alert">
      <!-- Icon -->
      <div class="inline-flex items-center justify-center shrink-0 w-7 h-7 text-fg-success bg-success-soft rounded">
        <font-awesome-icon icon="fa-solid fa-check" class="w-5 h-5" />
        <span class="sr-only">Check icon</span>
      </div>

      <!-- Text -->
      <div class="ms-3 text-sm font-normal">
        Saved '{{ painting.title }}' by '{{ painting.author }}' with {{ painting.numPaintings }} paintings
      </div>

      <!-- Close -->
      <button type="button" class="button-icon-only" aria-label="Close"
        :data-dismiss-target="`#toast-success-${painting.id}`">
        <span class="sr-only">Close</span>
        <font-awesome-icon icon="fa-solid fa-xmark" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

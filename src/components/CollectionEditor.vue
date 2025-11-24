<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import { initFlowbite } from "flowbite";
import { computed, onMounted, onUpdated, ref } from "vue";
import RenderPainting from "./RenderPainting.vue";

interface Props {
  paintings: Painting[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "clear"): void;
}>();

const numCols = ref(2);

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

const paintingColumns = computed(() => {
  let columns = [] as Painting[][];
  const chunkSize = numCols.value;
  for (let i = 0; i < props.paintings.length; i += chunkSize) {
    const chunk = props.paintings.slice(i, i + chunkSize);
    columns.push(chunk);
  }

  return columns;
});

async function saveCollection() {
  // TODO: Save
  console.log("Saved collection")
  emit("clear");
}
</script>

<template>
  <div>
    <!-- Toast notification -->
    <div id="toast-interactive"
      class="fixed z-100 bottom-5 right-5 space-y-4 p-3 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default"
      role="alert">
      <div class="flex">
        <div class="inline-flex items-center justify-center shrink-0 w-9 h-9 text-fg-brand bg-brand-softer rounded">
          <font-awesome-icon icon="fa-solid fa-grip-vertical" class="w-5 h-5" aria-hidden="true" />
          <span class="sr-only">Refresh icon</span>
        </div>
        <div class="ms-3 text-sm font-normal text-body">
          <span class="mb-1 text-base font-medium text-heading">Collection Editor</span>
          <div class="mb-3">{{ paintings.length }} paintings selected</div>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" data-dismiss-target="#toast-interactive"
              class="w-full text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-xs px-3 py-1.5 focus:outline-none"
              @click="$emit('clear')">
              Clear
            </button>
            <button type="button"
              class="w-full inline-flex items-center justify-center text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-xs px-3 py-1.5 focus:outline-none"
              data-modal-target="collection-editor-modal" data-modal-show="collection-editor-modal">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor modal -->
    <div id="collection-editor-modal" data-modal-backdrop="static" tabindex="-1" aria-hidden="true"
      class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-200 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-950/60">
      <div class="relative p-4 w-full max-w-7xl max-h-full">
        <!-- Modal content -->
        <div
          class="flex flex-col max-h-full relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
          <!-- Modal header -->
          <div class="flex items-center justify-between border-b border-default pb-4 md:pb-5">
            <h3 class="text-lg font-medium text-heading">Collection Editor</h3>
          </div>

          <!-- Modal body -->
          <div class="space-y-4 md:space-y-6 py-4 md:py-6 h-[600px] overflow-y-auto">

            <!-- Num columns -->
            <div class="max-w-sm mx-auto">
              <label for="painting-collection-cols" class="block mb-2.5 text-sm font-medium text-heading">Num
                cols:</label>
              <input type="number" id="painting-collection-cols" aria-describedby="helper-text-explanation"
                v-model="numCols"
                class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" />
            </div>

            <!-- Paintings -->
            <div>
              <div v-for="column in paintingColumns" class="flex flex-row flex-wrap w-full justify-center">
                <div v-for="painting in column" class="flex justify-center items-center flex-col">
                  <div class="painting relative h-[192px] w-[192px]">
                    <RenderPainting :painting-id="painting.id"></RenderPainting>

                    <div class="overlay absolute top-0 left-0 right-0 bg-gray-950/60">{{ painting.title }}</div>
                    <div class="overlay absolute bottom-0 left-0 right-0 bg-gray-950/60">{{ painting.authorName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="flex items-center justify-end border-t border-default space-x-4 pt-4 md:pt-5">
            <button data-modal-hide="collection-editor-modal" type="button"
              class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
              @click="saveCollection()">
              Save
            </button>
            <button data-modal-hide="collection-editor-modal" type="button"
              class="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.painting .overlay {
  visibility: hidden;
}

.painting:hover .overlay {
  visibility: visible;
}
</style>

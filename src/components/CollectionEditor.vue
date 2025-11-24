<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import { initFlowbite } from "flowbite";
import { onMounted, onUpdated } from "vue";
import RenderPainting from "./RenderPainting.vue";

interface Props {
  paintings: Painting[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "clear"): void;
}>();

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
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
    <div
      id="toast-interactive"
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
            <button
              type="button"
              data-dismiss-target="#toast-interactive"
              class="w-full text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-xs px-3 py-1.5 focus:outline-none"
              @click="$emit('clear')">
              Clear
            </button>
            <button
              type="button"
              class="w-full inline-flex items-center justify-center text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-xs px-3 py-1.5 focus:outline-none"
              data-modal-target="collection-editor-modal"
              data-modal-show="collection-editor-modal">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor modal -->
    <div
      id="collection-editor-modal"
      data-modal-backdrop="static"
      tabindex="-1"
      aria-hidden="true"
      class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-200 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-950/60">
      <div class="relative p-4 w-full max-w-7xl max-h-full">
        <!-- Modal content -->
        <div class="flex flex-col max-h-full relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
          <!-- Modal header -->
          <div class="flex items-center justify-between border-b border-default pb-4 md:pb-5">
            <h3 class="text-lg font-medium text-heading">Collection Editor</h3>
          </div>

          <!-- Modal body -->
          <div class="space-y-4 md:space-y-6 py-4 md:py-6 h-[600px] overflow-y-auto">
            <div class="flex flex-row flex-wrap w-full gap-4 justify-center">
              <div v-for="painting in paintings" class="flex justify-center items-center flex-col gap-2 mb-4">
                <div class="w-full text-center pl-1">
                  <div>
                    <RouterLink :to="{ name: 'painting', params: { id: painting.id } }" class="hyperlink">
                      {{ painting.title }}
                    </RouterLink>
                  </div>
                </div>

                <div class="h-[256px] w-[256px]">
                  <RenderPainting :painting-id="painting.id"></RenderPainting>
                </div>

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
          </div>

          <!-- Modal footer -->
          <div class="flex items-center justify-end border-t border-default space-x-4 pt-4 md:pt-5">
            <button
              data-modal-hide="collection-editor-modal"
              type="button"
              class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
              @click="saveCollection()">
              Save
            </button>
            <button
              data-modal-hide="collection-editor-modal"
              type="button"
              class="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

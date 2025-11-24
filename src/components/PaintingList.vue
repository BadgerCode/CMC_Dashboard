<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import RenderPainting from "./RenderPainting.vue";
import { ref } from "vue";
import { Config } from "@/config";
import CollectionEditor from "./CollectionEditor.vue";

interface Props {
  paintings: Painting[];
}
const props = defineProps<Props>();

const selectedPaintings = ref([] as Painting[]);
</script>

<template>
  <div>
    <div class="flex flex-row flex-wrap w-full gap-4 justify-center">
      <div v-for="painting in paintings" class="flex justify-center items-center flex-col gap-2 mb-4">
        <div class="w-full text-center pl-1">
          <div>
            <RouterLink :to="{ name: 'painting', params: { id: painting.id } }" class="hyperlink">
              {{ painting.title }}
            </RouterLink>
          </div>
        </div>

        <div v-if="Config.FEATURE_COLLECTIONS_EDITOR" class="h-[256px] w-[256px]">
          <input
            type="checkbox"
            name="painting-select"
            :id="`painting-select-${painting.id}`"
            :value="painting"
            v-model="selectedPaintings"
            class="hidden peer" />
          <label
            :for="`painting-select-${painting.id}`"
            class="h-[256px] w-[256px] inline-flex items-center justify-between p-2 text-body bg-neutral-primary-soft border-1 border-default rounded-base cursor-pointer peer-checked:hover:bg-brand-softer peer-checked:border-brand-subtle peer-checked:bg-brand-softer hover:bg-neutral-secondary-medium peer-checked:text-fg-brand-strong">
            <RenderPainting :painting-id="painting.id"></RenderPainting>
          </label>
        </div>
        <div v-else class="h-[256px] w-[256px]">
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

    <CollectionEditor
      v-if="Config.FEATURE_COLLECTIONS_EDITOR && selectedPaintings.length > 0"
      :paintings="selectedPaintings"
      @clear="selectedPaintings.splice(0)"></CollectionEditor>
  </div>
</template>

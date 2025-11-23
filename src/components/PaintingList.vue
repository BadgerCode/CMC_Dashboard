<script setup lang="ts">
import type { Painting } from '@/api/paintings/painting';
import RenderPainting from './RenderPainting.vue';

interface Props {
  paintings: Painting[];
}
const props = defineProps<Props>();

</script>

<template>
  <div v-for="painting in paintings" class="painting flex justify-center items-center flex-col gap-2 mb-4">
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
</template>

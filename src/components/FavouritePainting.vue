<script setup lang="ts">
import { favouritesStore } from '@/store/favourites-state';
import { computed } from 'vue';

interface Props {
  paintingId: string;
  title: string;
  author: string;
}
const props = defineProps<Props>();

const isFavourite = computed(() => favouritesStore.paintings.find(p => p.id == props.paintingId) != null);

function toggleFavourite() {
  if (isFavourite.value) {
    favouritesStore.removePainting(props.paintingId);
  }
  else {
    favouritesStore.addPainting({
      id: props.paintingId,
      favouritedAt: new Date().toISOString()
    });
  }
}
</script>

<template>
  <button type="button" class="button-icon-only" aria-label="Favourite" @click="toggleFavourite()">
    <span class="sr-only">Favourite</span>
    <font-awesome-icon v-if="isFavourite" icon="fa-solid fa-heart" />
    <font-awesome-icon v-else icon="fa-regular fa-heart" />
  </button>
</template>

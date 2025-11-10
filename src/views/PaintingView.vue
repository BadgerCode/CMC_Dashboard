<script setup lang="ts">
import PaintingOverview from "@/components/PaintingOverview.vue";

interface Props {
  id: string
}
defineProps<Props>()
</script>

<template>
  <div class="flex flex-row gap-4 mb-4">
    <div>
      <RouterLink :to="{ name: 'gallery' }" class="hyperlink">
        Gallery
      </RouterLink>
    </div>

    <div>
      <RouterLink :to="{ name: 'itemSales', params: { itemType: 'PAINTING' } }" class="hyperlink">
        Painting sales and shops
      </RouterLink>
    </div>
  </div>

  <PaintingOverview :painting-id="id"></PaintingOverview>
</template>

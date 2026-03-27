<script setup lang="ts">
import { onMounted } from "vue";
import ItemTypeOverview from "@/components/ItemTypeOverview.vue";

interface Props {
  itemType: string;
}
const props = defineProps<Props>();

onMounted(async () => {
  if (!props.itemType) return;
});
</script>

<template>
  <!-- TODO: Bring ItemTypeOverview content into here -->
  <ItemTypeOverview :item-type="itemType"></ItemTypeOverview>
</template>

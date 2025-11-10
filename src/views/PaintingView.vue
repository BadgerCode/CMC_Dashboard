<script setup lang="ts">
import PaintingOverview from "@/components/PaintingOverview.vue";

interface Props {
  id: string
}
defineProps<Props>()
</script>

<template>
  <PaintingOverview :painting-id="id"></PaintingOverview>
</template>

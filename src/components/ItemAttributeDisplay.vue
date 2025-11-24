<script setup lang="ts">
import type { SNBTData } from "@/models/snbt";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { formatPotionEffect } from "@/utilities/potion-format";
import RenderPainting from "./RenderPainting.vue";

interface Props {
  snbt: SNBTData;
}
defineProps<Props>();
</script>

<template>
  <div>
    <div v-if="snbt.playerHeadPlayerName">Player: {{ snbt.playerHeadPlayerName }}</div>
    <div v-if="snbt.potionEffect">{{ formatPotionEffect(snbt.potionEffect) }}</div>
    <div v-if="snbt.customDiscSong">{{ formatCustomDisc(snbt.customDiscSong).toLocaleLowerCase() }}</div>
    <div v-if="snbt.writtenBookAuthor">Title: {{ snbt.writtenBookTitle }}</div>
    <div v-if="snbt.writtenBookAuthor">Author: {{ snbt.writtenBookAuthor }}</div>
    <div v-if="snbt.writtenBookPageCount">Pages: {{ snbt.writtenBookPageCount }}</div>
    <div v-if="snbt.paintingID != null">
      <!-- Painting title -->
      <div v-if="snbt.paintingTitle">
        <RouterLink :to="{ name: 'painting', params: { id: snbt.paintingID } }" class="hyperlink">
          {{ snbt.paintingTitle }}
        </RouterLink>
        <span v-if="snbt.paintingOriginality"> ({{ snbt.paintingOriginality }})</span>
      </div>
      <!-- Painting preview -->
      <div>
        <div class="h-[32px] w-[32px]">
          <RouterLink :to="{ name: 'painting', params: { id: snbt.paintingID } }" class="hyperlink">
            <RenderPainting :painting-id="snbt.paintingID"></RenderPainting>
          </RouterLink>
        </div>
      </div>
      <!-- Painting author -->
      <div v-if="snbt.paintingAuthor">
        By
        <RouterLink :to="{ name: 'gallery', params: { authorName: snbt.paintingAuthor } }" class="hyperlink">
          {{ snbt.paintingAuthor }}
        </RouterLink>
      </div>
    </div>

    <div v-for="enchantment in snbt.enchantments">{{ formatEnchantment(enchantment) }}</div>
  </div>
</template>

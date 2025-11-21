<script setup lang="ts">
import type { SNBTData } from "@/models/snbt";
import { formatCustomDisc } from "@/utilities/custom-disc-format";
import { formatEnchantment } from "@/utilities/enchantment-format";
import { formatPotionEffect } from "@/utilities/potion-format";

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
    <div v-if="snbt.paintingTitle || snbt.paintingOriginality">
      <span v-if="snbt.paintingTitle"
        >Title:
        <RouterLink :to="{ name: 'painting', params: { id: snbt.paintingID } }" class="hyperlink">
          {{ snbt.paintingTitle }}
        </RouterLink>
      </span>
      <span v-if="snbt.paintingOriginality"> ({{ snbt.paintingOriginality }})</span>
    </div>
    <div v-if="snbt.paintingAuthor">
      Author:
      <RouterLink :to="{ name: 'gallery', params: { authorName: snbt.paintingAuthor } }" class="hyperlink">
        {{ snbt.paintingAuthor }}
      </RouterLink>
    </div>

    <div v-for="enchantment in snbt.enchantments">{{ formatEnchantment(enchantment) }}</div>
  </div>
</template>

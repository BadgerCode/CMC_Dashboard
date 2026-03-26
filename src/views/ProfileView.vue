<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import { Config } from "@/config";
import { userStore } from "@/store/user-state";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  if (userStore.user == null) {
    // Anonymous profile not supported currently
    router.push({ name: "home" });
    return;
  }

  // TODO: Load additional user data from API

  loading.value = false;
});
</script>

<template>
  <div>
    <Loading v-if="loading" :fill-space="true"></Loading>
    <div v-else>
      <!-- Profile overview -->
      <div class="border-b border-gray-500 pb-5">
        <div class="mb-2">
          <img class="rounded-full w-200px h-200px border border border-gray-500" :src="userStore.user?.avatarURL" />
        </div>
        <h1 class="text-3xl font-bold">{{ userStore.user?.displayName }}</h1>

        <div class="text-gray-300">Signed in via Discord</div>
      </div>
    </div>
  </div>
</template>

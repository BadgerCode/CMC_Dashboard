<script setup lang="ts">
import { Config } from "@/config";
import { userStore } from "@/store/user-state";
import { initFlowbite } from "flowbite";
import { onMounted, useId } from "vue";

const id = useId();

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});
</script>

<template>
  <div>
    <!-- Sign in -->
    <div v-if="userStore.user == null" class="text-sm border border-gray-500 md:py-2 md:px-3 rounded">
      <a :href="Config.DISCORD_LOGIN_URL" class="navbarLink">Sign in</a>
    </div>

    <!-- Profile button -->
    <div v-else>
      <div class="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <button
          type="button"
          class="flex text-sm bg-neutral-primary rounded-full md:me-0 focus:ring-4 focus:ring-neutral-tertiary cursor-pointer"
          :id="`${id}-button`"
          aria-expanded="false"
          :data-dropdown-toggle="`${id}-dropdown`"
          data-dropdown-placement="bottom">
          <span class="sr-only">Open user menu</span>
          <img class="w-8 h-8 rounded-full" :src="userStore.user.avatarURL" alt="user photo" />
        </button>
      </div>

      <!-- Profile Dropdown menu -->
      <div class="z-50 hidden bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44" :id="`${id}-dropdown`">
        <div class="px-4 py-3 text-sm border-b border-default-medium">
          <span class="block text-heading font-medium">{{ userStore.user?.displayName }}</span>
        </div>
        <ul class="p-2 text-sm text-body font-medium" :aria-labelledby="`${id}-button`">
          <li>
            <RouterLink
              :to="{ name: 'profile' }"
              class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded cursor-pointer">
              Profile
            </RouterLink>
          </li>
          <li>
            <a
              class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded cursor-pointer"
              @click="userStore.logout()">
              Sign out</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

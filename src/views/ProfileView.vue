<script setup lang="ts">
import { fetchUserInfo } from "@/api/user/api";
import Loading from "@/components/Loading.vue";
import { Config } from "@/config";
import { userStore } from "@/store/user-state";
import { initFlowbite } from "flowbite";
import { onMounted, onUpdated, ref } from "vue";
import { useRouter } from "vue-router";

interface UserResponse {
  userID: string;
  displayName: string;
  avatarURL: string;
  discordUsername: string;
  minecraftUsername: string;
  minecraftUsernameVerified: boolean;
}

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const saveHint = ref(null as string | null);
const userInfo = ref(null as UserResponse | null);

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  loading.value = true;

  userInfo.value = await fetchUserInfo();
  // Anonyomous profile not supported currently
  if(userInfo.value == null) {
    router.push({ name: "home" });
    return;
  }

  loading.value = false;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

async function saveUser() {
  saving.value = true;
  saveHint.value = null;

  // Save user info
  let httpResponse = await fetch(`${Config.APIURL}/api/users/me`, {
    method: "patch",
    headers: new Headers([
      ["Authorization", `Bearer ${userStore.jwt}`],
      ["Content-Type", "application/json"],
    ]),
    body: JSON.stringify({
      minecraftUsername: userInfo.value?.minecraftUsername,
    }),
  });

  if (httpResponse.status !== 200) {
    saveHint.value = "There was an error saving your profile";
  } else {
    saveHint.value = "Saved!";
  }

  saving.value = false;
}
</script>

<template>
  <div>
    <Loading v-if="loading" :fill-space="true"></Loading>
    <div v-else-if="userInfo != null">
      <!-- Profile overview -->
      <div class="border-b border-gray-500 pb-5">
        <div class="mb-2">
          <img class="rounded-full w-200px h-200px border border border-gray-500" :src="userInfo.avatarURL" />
        </div>
        <h1 class="text-3xl font-bold">{{ userInfo.displayName }}</h1>

        <div class="text-gray-300">Signed in via Discord ({{ userInfo.discordUsername }})</div>
        <div class="hint-text">To reload your discord profile details, sign out and sign back in again.</div>
      </div>

      <!-- User pages -->
      <div class="border-b border-gray-500 py-5" v-if="userInfo.minecraftUsername">
        <h3 class="text-lg font-medium text-heading">Your Pages</h3>

        <div class="flex flex-row gap-8 items-center">
          <RouterLink :to="{ name: 'shopOwnerView', params: { username: userInfo.minecraftUsername } }" class="hyperlink">
            Shops
          </RouterLink>

          <RouterLink :to="{ name: 'gallery', params: { authorName: userInfo.minecraftUsername } }" class="hyperlink">
            Artwork
          </RouterLink>
        </div>
      </div>

      <!-- Additional fields -->
      <div class="border-b border-gray-500 py-5">
        <!-- Minecraft username -->
        <div class="max-w-sm mb-2">
          <label class="block mb-2.5 font-medium text-heading">Minecraft Username</label>

          <div class="flex flex-row gap-2 w-80">
            <input type="text" class="textbox w-80" placeholder="Username" v-model="userInfo.minecraftUsername" />
          </div>

          <div class="hint-text">
            <div v-if="userInfo.minecraftUsernameVerified">Verified</div>
            <div v-else>Username not verified.</div>
          </div>
        </div>

        <div v-if="!userInfo.minecraftUsernameVerified" id="accordion-collapse" data-accordion="collapse" class="hint-text accordion max-w-lg"">
          <h2 id="accordion-collapse-heading-1">
            <button
              type="button"
              class="accordion-header-button"
              data-accordion-target="#accordion-collapse-body-1"
              aria-expanded="false"
              aria-controls="accordion-collapse-body-1">
              <span>Verification</span>
              <svg
                data-accordion-icon
                class="w-5 h-5 rotate-180 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 15 7-7 7 7" />
              </svg>
            </button>
          </h2>
          <div id="accordion-collapse-body-1" class="accordion-body hidden" aria-labelledby="accordion-collapse-heading-1">
            <div class="p-3 text-body">
              <p class="mb-2">Some actions require verification.</p>
              <p class="mb-2">To get verified, send a message to BadgerCode in-game with your discord username.</p>
              <p>/mail send BadgerCode my discord username is NameGoesHere</p>
            </div>
          </div>
        </div>

        <div class="mt-6 mb-1">
          <button type="button" class="button-primary" @click="saveUser()" :disabled="saving">Update Profile</button>
        </div>
        <div class="hint-text" v-if="saveHint">{{ saveHint }}</div>
      </div>
    </div>
  </div>
</template>

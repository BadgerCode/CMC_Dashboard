<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import { Config } from "@/config";
import { userStore } from "@/store/user-state";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

interface UserResponse {
  userID: string;
  displayName: string;
  avatarURL: string;
  discordUsername: string;
  minecraftUsername: string;
}

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const saveHint = ref(null as string | null);
const userInfo = ref(null as UserResponse | null);

onMounted(async () => {
  loading.value = true;
  if (userStore.user == null) {
    // Anonymous profile not supported currently
    router.push({ name: "home" });
    return;
  }

  // Load additional user data from API
  let httpResponse = await fetch(`${Config.APIURL}/api/users/me`, {
    method: "get",
    headers: new Headers([["Authorization", `Bearer ${userStore.jwt}`]]),
  });

  if (httpResponse.status !== 200) {
    userStore.logout();
    router.push({ name: "home" });
    return;
  }

  let response = await httpResponse.json();
  userInfo.value = response.result;

  loading.value = false;
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

      <!-- Additional fields -->
      <div class="border-b border-gray-500 py-5">
        <!-- Minecraft username -->
        <div class="max-w-sm">
          <label class="block mb-2.5 font-medium text-heading">Minecraft Username</label>

          <div class="flex flex-row gap-2 w-80">
            <input type="text" class="textbox w-80" placeholder="Username" v-model="userInfo.minecraftUsername" />
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

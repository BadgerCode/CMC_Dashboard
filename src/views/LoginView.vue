<script setup lang="ts">
import { Config } from "@/config";
import { userStore } from "@/store/user-state";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

interface Props {
  method: string;
}
const props = defineProps<Props>();
const loginFailed = ref(false);

// Discord redirect back with the query params after the hash instead of ?
const fragment = new URLSearchParams(window.location.hash.slice(1));
const [accessToken, tokenType] = [fragment.get("access_token"), fragment.get("token_type")];

onMounted(async () => {
  if (!accessToken) {
    console.log("No credentials. Redirecting home");
    router.push({ name: "home" });
    return;
  }

  // Login to API
  let url = `${Config.APIURL}/api/login`;
  let loginRequest = {
    type: "Discord",
    credentials: {
      accessToken: accessToken,
    },
  };
  let httpResponse = await fetch(url, {
    method: "post",
    headers: new Headers([["Content-Type", "application/json"]]),
    body: JSON.stringify(loginRequest),
  });

  if (httpResponse.status !== 200) {
    loginFailed.value = true;
    return;
  }

  let response = await httpResponse.json();

  // Store in local storage & update user state
  userStore.login(response.jwt, {
    id: response.userID,
    displayName: response.displayName,
    avatarURL: response.avatarURL,
  });

  // Redirect to home page
  router.push({ name: "home" });
});
</script>

<template>
  <div>
    <div v-if="loginFailed">
      <div>Login failed. Please try again</div>
      <div><a :href="Config.DISCORD_LOGIN_URL" class="button">Login</a></div>
    </div>
  </div>
</template>

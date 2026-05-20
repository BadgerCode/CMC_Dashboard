import { Config } from "@/config";
import { userStore } from "@/store/user-state";
import type { UserResponse } from "./user";

export async function fetchUserInfo(): Promise<UserResponse | null> {
  // Don't reload if data is recent
  if (userStore.fullUserInfo) return userStore.fullUserInfo;

  if (userStore.user == null) {
    return null;
  }

  // Load additional user data from API
  let httpResponse = await fetch(`${Config.APIURL}/api/users/me`, {
    method: "get",
    headers: new Headers([["Authorization", `Bearer ${userStore.jwt}`]]),
  });

  if (httpResponse.status !== 200) {
    console.error("Failed to fetch user info");
    userStore.logout();
    return null;
  }

  let response = await httpResponse.json();
  userStore.fullUserInfo = response.result;
  return userStore.fullUserInfo;
}

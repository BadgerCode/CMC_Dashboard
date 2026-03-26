import { reactive } from "vue";

export interface User {
  id: string;
  displayName: string;
  avatarURL: string;
}

export const userStore = reactive({
  user: null as User | null,
  jwt: null as string | null,

  // Data management
  login(jwt: string, user: User) {
    localStorage.setItem("userToken", jwt);
    this.user = user;
  },

  load() {
    this.jwt = localStorage.getItem("userToken");
    if (this.jwt == null) return;

    try {
      // Fetch user info
      // TODO: Consider using /api/users/me endpoint
      let userInfo = JSON.parse(atob(this.jwt.split(".")[1]!));
      this.user = {
        id: userInfo.nameid,
        displayName: userInfo.name,
        avatarURL: userInfo.picture,
      };

      console.log("Loaded user profile", this.user);
    } catch (error) {
      // Invalid JWT
      this.logout();
    }
  },

  logout() {
    this.jwt = null;
    this.user = null;
    localStorage.removeItem("userToken");
  },
});

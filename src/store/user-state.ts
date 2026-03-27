import { reactive } from "vue";

export interface User {
  id: string;
  displayName: string;
  avatarURL: string;
}

export const userStore = reactive({
  user: null as User | null,
  jwt: null as string | null,
  recentlyViewedItems: [] as string[],

  // Data management
  login(jwt: string, user: User) {
    localStorage.setItem("userToken", jwt);
    this.jwt = jwt;
    this.user = user;
  },

  load() {
    // Load recently viewed items
    let rawRecentItems = localStorage.getItem("recentlyViewedItems");
    if (rawRecentItems != null) {
      try {
        this.recentlyViewedItems = JSON.parse(rawRecentItems);
      } catch (error) {
        localStorage.removeItem("recentlyViewedItems");
      }
    }

    // Load JWT
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

  addRecentlyViewedItem(itemType: string) {
    let existingIndex = this.recentlyViewedItems.findIndex(i => i == itemType);
    if (existingIndex !== -1) {
      this.recentlyViewedItems.splice(existingIndex, 1);
    }

    this.recentlyViewedItems.push(itemType);

    let itemsToRemove = Math.max(0, this.recentlyViewedItems.length - 16);
    this.recentlyViewedItems = this.recentlyViewedItems.slice(itemsToRemove);

    localStorage.setItem("recentlyViewedItems", JSON.stringify(this.recentlyViewedItems));
  }
});

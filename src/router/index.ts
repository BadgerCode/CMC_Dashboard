import GalleryView from "@/views/GalleryView.vue";
import HomeView from "@/views/HomeView.vue";
import SaleView from "@/views/SaleView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: 'Home'
      }
    },
    {
      path: "/gallery",
      name: "gallery",
      component: GalleryView,
      meta: {
        title: 'Gallery'
      }
    },
    {
      path: "/sale/:id",
      name: "sale",
      component: SaleView,
      props: true,
      meta: {
        title: 'Sale Info'
      }
    }
  ],
});

export default router;

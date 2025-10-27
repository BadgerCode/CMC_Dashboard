import GalleryView from "@/views/GalleryView.vue";
import HomeView from "@/views/HomeView.vue";
import ItemTypeView from "@/views/ItemTypeView.vue";
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
      path: "/gallery/:authorName?",
      name: "gallery",
      component: GalleryView,
      props: true,
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
    },
    {
      path: "/items/:itemType",
      name: "itemSales",
      component: ItemTypeView,
      props: true,
      meta: {
        title: 'Item Sales'
      }
    }
  ],
});

export default router;

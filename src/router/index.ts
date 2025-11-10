import GalleryView from "@/views/GalleryView.vue";
import HomeView from "@/views/HomeView.vue";
import ItemTypeView from "@/views/ItemTypeView.vue";
import PaintingView from "@/views/PaintingView.vue";
import SaleView from "@/views/SaleView.vue";
import ShopsView from "@/views/ShopsView.vue";
import WaystonesView from "@/views/WaystonesView.vue";
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
      path: "/shops",
      name: "shops",
      component: ShopsView,
      meta: {
        title: 'Shops'
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
      path: "/paintings/:id",
      name: "painting",
      component: PaintingView,
      props: true,
      meta: {
        title: 'Painting'
      }
    },
    {
      path: "/sale/:id",
      name: "sale",
      component: SaleView,
      props: true,
      meta: {
        title: 'Sale'
      }
    },
    {
      path: "/items/:itemType",
      name: "itemSales",
      component: ItemTypeView,
      props: true,
      meta: {
        title: 'Item Information'
      }
    },
    {
      path: "/waystones",
      name: "waystones",
      component: WaystonesView,
      meta: {
        title: 'Waystones'
      }
    },
  ],
});

export default router;

import GalleryView from "@/views/GalleryView.vue";
import HomeView from "@/views/HomeView.vue";
import ItemTypeView from "@/views/ItemTypeView.vue";
import PaintingView from "@/views/PaintingView.vue";
import PlayerCountView from "@/views/PlayerCountView.vue";
import SaleView from "@/views/SaleView.vue";
import ShopsView from "@/views/ShopsView.vue";
import VillagerTradesView from "@/views/VillagerTradesView.vue";
import WaystonesView from "@/views/WaystonesView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { setPageTitle } from "./pageTitle";
import LoginView from "@/views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "Home",
      },
    },
    {
      path: "/shops",
      name: "shops",
      component: ShopsView,
      meta: {
        title: "Shops",
      },
    },
    {
      path: "/gallery/:authorName?",
      name: "gallery",
      component: GalleryView,
      props: true,
      meta: {
        title: "Gallery",
      },
    },
    {
      path: "/paintings/:id",
      name: "painting",
      component: PaintingView,
      props: true,
      meta: {
        title: "Painting",
      },
    },
    {
      path: "/sale/:id",
      name: "sale",
      component: SaleView,
      props: true,
      meta: {
        title: "Sale",
      },
    },
    {
      path: "/items/:itemType",
      name: "itemSales",
      component: ItemTypeView,
      props: true,
      meta: {
        title: "Item Information",
      },
    },
    {
      path: "/waystones",
      name: "waystones",
      component: WaystonesView,
      meta: {
        title: "Waystones",
      },
    },
    {
      path: "/playercounts",
      name: "playercounts",
      component: PlayerCountView,
      meta: {
        title: "Player Numbers"
      }
    },
    {
      path: "/villagers",
      name: "villagerTrades",
      component: VillagerTradesView,
      meta: {
        title: "Villager Trades"
      }
    },
    {
      path: "/login/:method",
      name: "loginHandler",
      component: LoginView,
      props: true,
      meta: {
        title: "Login"
      }
    }
  ],
});

router.beforeEach((to) => {
  const { title, description } = to.meta;
  const defaultTitle = 'Dashboard';
  const defaultDescription = 'Sales and more for the SMP Online server.';

  setPageTitle((title as string | undefined) || defaultTitle);

  const descriptionElement = document.querySelector('head meta[name="description"]')!;

  descriptionElement.setAttribute('content', (description as string | undefined) || defaultDescription);
});


export default router;

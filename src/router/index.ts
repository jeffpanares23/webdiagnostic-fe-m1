import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import Login from "@/views/Login.vue";

// Define Routes
const routes: Array<RouteRecordRaw> = [
  { path: "/", name: "Login", component: Login },
  {
    path: "/dashboard",
    name: "DiagnosticDashboard",
    component: DashboardView,
    meta: { requiresAuth: true, title: "Dashboard" },
  },
  // // Not Found Page
  // {
  //   path: "/404",
  //   name: "NotFound",
  //   component: () =>
  //     import(/* webpackChunkName: "not-found" */ "@/views/NotFound.vue"),
  // },
  { path: "/:pathMatch(.*)*", redirect: "/404" },
];

// Create Router Instance
const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes,
});

// Add Navigation Guards
router.beforeEach((to, from, next) => {
  const title = (to.meta.title as string) || "Default Title"; // Explicitly cast to string
  document.title = title;
  const token = localStorage.getItem("token");

  // const isAuthenticated = localStorage.getItem("token"); // Example Auth Check

  // Check meta.requiresAuth for protected routes
  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   next("/");
  // } else {
  //   next();
  // }

  if (to.meta.requiresAuth && !token) {
    return next("/");
  }
  // Otherwise, allow navigation
  next();
});

export default router;

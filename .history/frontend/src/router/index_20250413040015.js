import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/Home.vue';  // ใช้ชื่อใหม่
import AboutPage from '../views/About.vue';  // ใช้ชื่อใหม่

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;

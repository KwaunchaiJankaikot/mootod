import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';  // ใช้ path ให้ถูกต้อง
import About from '../views/About.vue';  // ใช้ path ให้ถูกต้อง

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;

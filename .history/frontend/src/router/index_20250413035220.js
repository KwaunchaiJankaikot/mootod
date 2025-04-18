import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';  // ตัวอย่างหน้าแรก
import About from '../views/About.vue';  // ตัวอย่างหน้าข้อมูล

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

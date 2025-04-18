import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/Home.vue';  // ใช้ชื่อใหม่ 'HomePage'
import AboutPage from '../views/About.vue';  // ใช้ชื่อใหม่ 'AboutPage'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage  // ใช้ชื่อใหม่ 'HomePage'
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage  // ใช้ชื่อใหม่ 'AboutPage'
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;

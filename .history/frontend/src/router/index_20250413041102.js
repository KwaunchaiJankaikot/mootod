import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';  // เปลี่ยนเป็น HomePage.vue
import AboutPage from '../views/About.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage  // ใช้ HomePage.vue เป็นหน้าแรก
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

import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import MenuComponent from '../components/MenuComponent.vue';  // นำเข้า MenuComponent.vue

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/menu',  // กำหนด path สำหรับการไปที่หน้า MenuComponent
    name: 'Menu',
    component: MenuComponent
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;

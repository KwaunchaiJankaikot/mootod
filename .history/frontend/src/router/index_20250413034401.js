import Vue from 'vue';
import VueRouter from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import MenuComponent from '@/components/MenuComponent.vue';
import MenuListComponent from '@/components/MenuListComponent.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/add-menu',
    name: 'add-menu',
    component: MenuComponent
  },
  {
    path: '/menu-list',
    name: 'menu-list',
    component: MenuListComponent
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
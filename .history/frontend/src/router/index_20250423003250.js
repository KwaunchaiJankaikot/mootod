import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import AddMenu from '../components/AddMenu.vue'; 
import MenuList from '../components/MenuList.vue'; 
import EditMenu from '../components/EditMenu.vue'; 
import InventoryPage from '../components/InventoryPage.vue'; 

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/add-menu',  
    name: 'Menu',
    component: AddMenu
  },
  {
    path: '/menu-list',  
    name: 'MenuList',
    component: MenuList
  },
  {
    path: '/edit-menu/:id',  
    name: 'edit-menu',
    component: EditMenu,     
    props: true,             
  },

  {
    path: '/inventorypage',  
    name: 'inventorypage',
    component: InventoryPage,             
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;

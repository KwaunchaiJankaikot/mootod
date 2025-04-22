import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import AddMenu from '../components/AddMenu.vue'; 
import MenuList from '../components/MenuList.vue'; 
import EditMenu from '../components/EditMenu.vue'; 

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
    path: '/edit-menu/:id',  // เส้นทางสำหรับการแก้ไขเมนู
    name: 'edit-menu',
    component: EditMenu,     // คอมโพเนนต์ที่จะแสดง
    props: true,             // ส่ง props ให้กับ EditMenu.vue
  },

  {
    path: '/edit-menu/:id',  // เส้นทางสำหรับการแก้ไขเมนู
    name: 'edit-menu',
    component: EditMenu,     
    props: true,            
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;

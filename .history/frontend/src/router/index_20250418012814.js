import Vue from 'vue'
import VueRouter from 'vue-router'

// ทำ Lazy-loading ของ components เพื่อเพิ่มประสิทธิภาพ
const Home = () => import('@/views/Home.vue')
const MenuList = () => import('@/views/MenuList.vue')
const AddMenu = () => import('@/views/AddMenu.vue')
const EditMenu = () => import('@/views/EditMenu.vue')
const NotFound = () => import('@/views/NotFound.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'หน้าหลัก' }
  },
  {
    path: '/menus',
    name: 'MenuList',
    component: MenuList,
    meta: { title: 'รายการเมนูอาหาร' }
  },
  {
    path: '/add-menu',
    name: 'AddMenu',
    component: AddMenu,
    meta: { title: 'เพิ่มเมนูใหม่' }
  },
  {
    path: '/edit-menu/:id',
    name: 'EditMenu',
    component: EditMenu,
    meta: { title: 'แก้ไขเมนูอาหาร' },
    props: true
  },
  {
    path: '*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 - ไม่พบหน้าที่ต้องการ' }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 }
  }
})

// เปลี่ยนชื่อแท็บตามหน้าที่เปิด
router.afterEach((to) => {
  const appName = 'ระบบจัดการร้านอาหาร'
  document.title = to.meta.title ? `${to.meta.title} | ${appName}` : appName
})

export default router
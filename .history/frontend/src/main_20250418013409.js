import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/tailwind.css'

// นำเข้า Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faPlus, faEdit, faTrashAlt, faArrowLeft, faCheck, faCheckCircle, 
  faExclamationCircle, faExclamationTriangle, faSearch, faUpload, 
  faUtensils, faSpinner, faInfoCircle
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// เพิ่มไอคอนที่ต้องการใช้
library.add(
  faPlus, faEdit, faTrashAlt, faArrowLeft, faCheck, faCheckCircle, 
  faExclamationCircle, faExclamationTriangle, faSearch, faUpload,
  faUtensils, faSpinner, faInfoCircle
)

// ลงทะเบียน component
Vue.component('font-awesome-icon', FontAwesomeIcon)

// ตั้งค่า prefix สำหรับ Font Awesome (ให้ใช้ <i class="fas fa-xxx">)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
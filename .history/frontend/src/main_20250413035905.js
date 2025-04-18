import { createApp } from 'vue';  // ใช้ createApp สำหรับ Vue 3
import App from './App.vue';
import router from './router';

const app = createApp(App);  // สร้างแอป Vue 3
app.use(router);  // ติดตั้ง router
app.config.productionTip = false;  // ปิด production tip (เหมือนใน Vue 2)

app.mount('#app');  // ติดตั้งแอปลงใน #app

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);  // ติดตั้ง Vue Router
app.mount('#app');

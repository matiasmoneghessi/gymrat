import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from './router';
import { useAuthStore } from '@/stores/auth';

import './styles/main.css';
import './styles/components.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Inicializamos la sesión de Supabase al arrancar la app.
const authStore = useAuthStore(pinia);
authStore.init();

app.mount('#app');


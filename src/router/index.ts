import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import RutinaView from '@/views/RutinaView.vue';
import LoginView from '@/views/LoginView.vue';
import CrearRutinaView from '@/views/CrearRutinaView.vue';
import EditarRutinaView from '@/views/EditarRutinaView.vue';
import RutinaCompartidaView from '@/views/RutinaCompartidaView.vue';
import EjercicioDetalleView from '@/views/EjercicioDetalleView.vue';
import SesionView from '@/views/SesionView.vue';
import DashboardView from '@/views/DashboardView.vue';
import StravaView from '@/views/StravaView.vue';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/crear-rutina',
    name: 'crear-rutina',
    component: CrearRutinaView,
  },
  {
    path: '/editar-rutina/:id',
    name: 'editar-rutina',
    component: EditarRutinaView,
    props: true,
  },
  {
    path: '/rutina/:id',
    name: 'rutina',
    component: RutinaView,
    props: true,
  },
  {
    path: '/compartir/:token',
    name: 'rutina-compartida',
    component: RutinaCompartidaView,
    props: true,
    meta: { public: true },
  },
  {
    path: '/ejercicio/:id',
    name: 'ejercicio-detalle',
    component: EjercicioDetalleView,
    props: true,
  },
  {
    path: '/sesion/nueva',
    name: 'sesion',
    component: SesionView,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
  },
  {
    path: '/strava',
    name: 'strava',
    component: StravaView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Esperar a que la sesión esté inicializada antes de decidir
  if (!authStore._initialized) {
    await authStore.init();
  }

  const isPublic = to.meta.public === true;
  const isAuthenticated = authStore.isAuthenticated;

  if (!isPublic && !isAuthenticated) {
    return { name: 'login' };
  }

  // Si ya está autenticado y quiere ir al login, redirigir a home
  if (isPublic && isAuthenticated) {
    return { name: 'home' };
  }
});

export default router;

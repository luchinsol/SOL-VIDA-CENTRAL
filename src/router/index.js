import { createRouter, createWebHistory } from 'vue-router';
//import Home from '../views/Home.vue'; // Asegúrate de tener este componente
//import About from '../views/About.vue'; // Asegúrate de tener este componente

import Login from '@/components/LoginVue.vue';

import InicioVue from '@/components/InicioVue.vue';
import GestionVue from '@/components/GestionVue.vue';
import RuteoVue from '@/components/RuteoVue.vue';
import ComponenteVue from '@/components/ComponenteVue.vue';
const routes = [
  {
    path: '/',
    name: 'LoginForm',
    component: Login
  },
  {
    path: '/gestion',
    name: 'Gestion',
    component: GestionVue
  },
  {
    path: '/home',
    name: 'Inicio',
    component: InicioVue
  },
  {
    path:'/ruta',
    name: 'Ruta',
    component:RuteoVue
  },
  {
    path:'/componente',
    name: 'Componente',
    component:ComponenteVue
  }

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;

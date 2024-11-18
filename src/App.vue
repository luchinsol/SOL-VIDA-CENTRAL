<template>
  <v-app>
    <!-- Drawer y App Bar solo se muestran si no estamos en LoginForm -->
    <v-navigation-drawer v-if="mostrarLayout" class="barracolor" app>
      <div class="contenedor">
        <div class="hijo">
          <v-img :src="require('@/assets/nuevito.png')"></v-img>
        </div>
      </div>

      <div class="cajablanco">
        <v-row class="mb-4">
          <v-col cols="3">
            <div class="imgcircle">
              <v-icon size="medium" color="white">mdi-account</v-icon>
            </div>
          </v-col>
          <v-col cols="9" class="d-flex flex-column justify-center align-center">
            <v-row class="text-white text-h6">
              <v-col>{{ nombreUsuario }}</v-col>
              <v-col>{{ apellidoUsuario }}</v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>

      <v-list nav>
        <router-link
          v-for="route in routes"
          :key="route.name"
          :to="{ name: route.name }"
          class="text-white no-underline"
        >
          <v-list-item
            :prepend-icon="route.icon"
            :title="route.title"
            class="menu-item text-white"
          ></v-list-item>
        </router-link>
      </v-list>

      <v-list nav style="margin-top: 450px;"> <!-- Ajusta el valor según necesites -->
  <v-list-item
    @click="logout"
    class="menu-item text-white"
  >
    <v-list-item-icon>
      <v-icon color="white">mdi-logout</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title class="text-white">Salir</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</v-list>
    </v-navigation-drawer>

    <!-- Contenido dinámico solo se muestra si no estamos en LoginForm -->
    <InicioVue v-if="mostrarLayout && this.$router.currentRoute.name !== 'LoginForm'" />
    <v-main class="ma-3">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import InicioVue from './components/InicioVue.vue';
import { mapState } from 'vuex';

export default {
  name: 'App',
  data() {
    return {
      routes: [
        { name: 'Inicio', icon: 'mdi-home', title: 'Inicio' },
        { name: 'Gestion', icon: 'mdi-file-account-outline', title: 'Gestión' },
        { name: 'Ruta', icon: 'mdi-motorbike', title: 'Ruta' },
      ],
    };
  },
  computed: {
    ...mapState({
      usuario: state => state.usuario, // Accede al usuario desde el estado de Vuex
    }),
    nombreUsuario() {
      return this.usuario ? this.usuario.nombres : ''; // Cambia a usuario.nickname
    },
    apellidoUsuario() {
      return this.usuario ? this.usuario.apellidos : '';
    },
    mostrarLayout() {
      return this.$route.name !== 'LoginForm'; // Devuelve true si la ruta actual no es LoginForm
    }
  },
  methods: {
    logout() {
      // Aquí podrías limpiar el estado de la sesión o realizar cualquier otra lógica necesaria.
      this.$router.push({ name: 'LoginForm' }); // Redirige a la página de LoginForm
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.contenedor {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hijo {
  width: 100px;
  height: 100px;
}

.imgcircle {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  background-color: rgb(63, 65, 87);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.barracolor {
  background-color: #292e33;
  color: white;
}

.cajablanco {
  padding-left: 20px;
  padding-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-white {
  color: white !important;
}



.no-underline {
  text-decoration: none;
}

/* Efecto de botón al hacer hover en los elementos del menú */
.menu-item:hover {
  background-color: #424850 !important;
}

.imgcircle {
  width: 50px;  /* Ajusta el tamaño del círculo */
  height: 50px; /* Asegúrate de que sea un círculo perfecto */
  border-radius: 50%; /* Hace que el contenedor sea redondo */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #424850; /* Color de fondo para el círculo, ajusta como prefieras */
}

.v-icon {
  font-size: 24px;  /* Ajusta el tamaño del ícono */
}



</style>

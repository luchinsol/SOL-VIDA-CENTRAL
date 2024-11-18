import { createStore } from 'vuex';

const store = createStore({
  state: {
    usuario: null,

    rol_id: null,
  },
  mutations: {
    setUsuario(state, usuario) {
      state.usuario = usuario;
    },
    setRol(state, rol_id) {
      state.rol_id = rol_id;
    }
  },
  getters: {
    isLoggedIn: state => !!state.usuario,
    getUsuario: state => state.usuario,
    getRol: state => state.rol_id
  }
});

export default store;

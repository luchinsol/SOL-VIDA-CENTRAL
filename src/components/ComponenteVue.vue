<template>
    <v-container>
      <!-- Tabla con selección de filas -->
      <v-card>
        <v-card-title>Pedidos</v-card-title>
        <v-data-table
          v-model="selectedPedidos"
          :items="items"
          :headers="headers"
          item-value="id"
          :returnObject="true"
          show-select
          class="elevation-1"
          :items-per-page="5"
          @update:modelValue="updateSelectedPedidos"
        >
          <template #[`item.fecha`]="{ item }">
            {{ formatDate(item.fecha) }}
          </template>
          <!-- Columna de acciones -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn icon @click="deletePedido(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
  
      <!-- Botón para ver elementos seleccionados -->
      <v-btn class="mt-4" color="primary" @click="openDialog">Ver Selección</v-btn>
  
      <!-- Diálogo con información de selección -->
      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title>Detalles de Selección</v-card-title>
          <v-card-text>
            <div v-if="selectedPedidos.length === 0">No hay elementos seleccionados.</div>
            <div v-else>
              <ul>
                <li v-for="pedido in selectedPedidos" :key="pedido.id">
                  <strong>ID:</strong> {{ pedido.id }} |
                  <strong>Tipo:</strong> {{ pedido.tipo }} |
                  <strong>Distrito:</strong> {{ pedido.distrito }} |
                  <strong>Estado:</strong> {{ pedido.estado }}
                </li>
              </ul>
              <v-btn color="red" @click="deleteSelectedPedidos">Eliminar Selección</v-btn>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
import { ref } from 'vue';

export default {
  name: 'Componente',
  setup() {
    const items = ref([
      { id: 1, tipo: 'Urgente', distrito: 'Lima', estado: 'Pendiente', fecha: '2024-01-10' },
      { id: 2, tipo: 'Normal', distrito: 'Arequipa', estado: 'Completado', fecha: '2024-02-12' },
      { id: 3, tipo: 'Urgente', distrito: 'Cusco', estado: 'En progreso', fecha: '2024-03-14' },
      { id: 4, tipo: 'Normal', distrito: 'Trujillo', estado: 'Pendiente', fecha: '2024-04-16' },
      { id: 5, tipo: 'Express', distrito: 'Piura', estado: 'Pendiente', fecha: '2024-05-18' }
    ]);

    const headers = ref([
      { title: 'ID', key: 'id', sortable: true },
      { title: 'Tipo', key: 'tipo', sortable: true },
      { title: 'Distrito', key: 'distrito', sortable: true },
      { title: 'Estado', key: 'estado', sortable: true },
      { title: 'Fecha', key: 'fecha', sortable: true },
      { title: 'Acciones', key: 'actions' }  // Nueva columna para las acciones
    ]);

    const selectedPedidos = ref([]);
    const dialog = ref(false);

    const openDialog = () => {
      if (selectedPedidos.value.length === 0) {
        alert('No hay elementos seleccionados');
      } else {
        dialog.value = true;
      }
    };

    const updateSelectedPedidos = (newSelection) => {
      selectedPedidos.value = newSelection;
    };

    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    };

    const deletePedido = (pedido) => {
      console.log(`Eliminar pedido con ID: ${pedido.id}`);
      // Elimina el pedido de la lista
      items.value = items.value.filter(item => item.id !== pedido.id);
      selectedPedidos.value = selectedPedidos.value.filter(item => item.id !== pedido.id);
    };

    const deleteSelectedPedidos = () => {
      console.log(`Eliminar selección de pedidos:`, selectedPedidos.value);
      selectedPedidos.value.forEach(pedido => {
        items.value = items.value.filter(item => item.id !== pedido.id);
      });
      selectedPedidos.value = [];  // Limpiar la selección después de eliminar
    };

    return {
      items,
      headers,
      selectedPedidos,
      dialog,
      openDialog,
      formatDate,
      updateSelectedPedidos,
      deletePedido,
      deleteSelectedPedidos
    };
  }
};
</script>

  <style scoped>
  /* Agrega estilos opcionales aquí */
  </style>
  
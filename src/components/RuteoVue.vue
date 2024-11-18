<template>
  <div>
    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Agregar este componente después de la última fila (v-row) de tu template -->
    <v-row>
      <v-col cols="12">
        <v-card class="mx-auto" max-width="400">
          <v-card-item>
            <v-row align="center" no-gutters>
              <v-col>
                <v-card-title class="text-h6">
                  Nos encontramos en la ruta N° {{ rutaIdLastPublica }}
                </v-card-title>
                <v-card-subtitle>
                  Última ruta registrada en el sistema
                </v-card-subtitle>
              </v-col>
            </v-row>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="4">
        <v-card elevation="6" flat class="pedidos-pendientes">
          <template v-slot:title>
            <div class="alineartexto">Pedidos Pendientes</div>
          </template>
          <template v-slot:text>
            <v-text-field v-model="search" label="Buscar" prepend-inner-icon="mdi-magnify" variant="outlined"
              hide-details single-line></v-text-field>
          </template>

          <v-data-table v-model:selected="selectedPedidos" :items="items" :headers="headers" :search="search"
            item-value="id" :items-per-page="5" show-select return-object class="elevation-1 pedidos-pendientes-table"
            @update:modelValue="updateSelectedPedidos">
            <template #[`item.fecha`]="{ item }">
              {{ formatDate(item.fecha) }}
            </template>

            <template #[`item.actions`]="{ item }">
              <v-icon class="mr-2 cursor-pointer" color="primary" @click="addToRoute(item)">
                mdi-plus
              </v-icon>
              <v-icon class="mr-2 cursor-pointer" color="error" @click="deletePedido(item)">
                mdi-delete
              </v-icon>
              <v-icon class="cursor-pointer" color="info" @click="viewOrder(item)">
                mdi-eye
              </v-icon>
            </template>
          </v-data-table>
        </v-card>

        <v-dialog v-model="orderDialog" max-width="600px">
          <v-card>
            <v-card-title>Detalles del Pedido #{{ selectedOrder?.id }}</v-card-title>
            <v-card-text>
              <div>Dirección: {{ selectedOrder?.direccion }}</div>
              <div>Total: {{ selectedOrder?.total }}</div>
              <div>Productos:</div>
              <pre>{{ productosYCantidadesPorPedido[selectedOrder?.id] }}</pre>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" text @click="orderDialog = false">Cerrar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>


      <v-col cols="4">
        <v-card elevation="6" flat class="pedidos-en-proceso">
          <template v-slot:title>
            <div class="alineartexto">Pedidos En Proceso</div>
          </template>
          <template v-slot:text>
            <v-text-field v-model="searchProceso" label="Buscar" prepend-inner-icon="mdi-magnify" variant="outlined"
              hide-details single-line></v-text-field>
          </template>

          <v-data-table :items="enproceso" :headers="headerProceso" :search="searchProceso" :items-per-page="5"
            :sort-by="[{ key: 'id', order: 'desc' }]" class="pedidos-en-proceso-table">
            <template #[`item.fecha`]="{ item }">
              {{ formatDate(item.fecha) }}
            </template>
            <template #[`item.direccion`]="{ item }">
              <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <a :href="getGoogleMapsLink(item.direccion)" target="_blank">
                  {{ item.direccion }}
                </a>
              </div>
            </template>

          </v-data-table>
        </v-card>
      </v-col>



      <v-col cols="4">
        <v-card elevation="6" flat class="conductores">
          <template v-slot:title>
            <div class="alineartexto">Conductores</div>
          </template>
          <template v-slot:text>
            <v-text-field v-model="searchConductores" label="Buscar" prepend-inner-icon="mdi-magnify" variant="outlined"
              hide-details single-line></v-text-field>
          </template>

          <v-data-table :items="conductores" :headers="conductoresHeaders" :search="searchConductores"
            :items-per-page="7" class="conductores-table">
            <template #[`item.estado`]="{ item }">
              <v-chip :color="item.estado === 'conectado' ? 'green' : 'red'" text-color="white" small>
                {{ item.estado }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>


    <v-row class="mt-4 justify-center">
      <v-btn @click="crearRutaPublica" color="primary" :loading="loading" class="btn-large">
        Crear ruta
      </v-btn>
      
    </v-row>

    


  </div>
</template>

<script>
import { ref, computed, toRaw, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'Ruta',
  setup() {
    // Define la variable como un ref() si se espera que cambie.
    const rutaIdLastPublica = ref(null);

    // Resto de la lógica
    const search = ref('');
    const searchConductores = ref('');
    const searchProceso = ref('');
    const selectedPedidos = ref([]);
    const selectedConductores = ref([]);
    const items = ref([]);
    const conductores = ref([]);
    const enproceso = ref([]);
    const orderDialog = ref(false);
    const selectedOrder = ref(null);
    const productosYCantidadesPorPedido = ref({});
    const loading = ref(false);
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    //const dialogProgress = ref(false)
    //const progress = ref(0)
    //const statusMessage = ref('')
    

    const headers = ref([
      { title: 'ID', key: 'id', sortable: true },
      { title: 'Tipo', key: 'tipo', sortable: true },
      { title: 'Distrito', key: 'distrito', sortable: true },
      { title: 'Estado', key: 'estado', sortable: true },
      { title: 'Fecha', key: 'fecha', sortable: true },
      { title: 'Ruta', key: 'ruta_id', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false }
    ]);
    const headerProceso = ref([
      { title: 'ID', key: 'id', sortable: true },
      { title: 'Tipo', key: 'tipo', sortable: true },
      { title: 'Distrito', key: 'distrito', sortable: true },
      { title: 'Estado', key: 'estado', sortable: true },
      { title: 'Fecha', key: 'fecha', sortable: true },
      { title: 'Ruta', key: 'ruta_id', sortable: true },
    ]);
    const conductoresHeaders = ref([
      { title: 'ID', key: 'id', sortable: true },
      { title: 'Nombre', key: 'nombre', sortable: true },
      { title: 'Estado', key: 'estado', sortable: true }
    ]);
    //const apiBaseUrl = 'http://127.0.0.1:4000';

    const apiBaseUrl = process.env.VUE_APP_API_URL;
    const apiDetallePedido = '/detallepedidopromo/';
    const api = '/api';

    const apiUrl = ref(process.env.VUE_APP_API_URL)


    const getGoogleMapsLink = (direccion) => {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    };

    const fetchPedidos = async () => {
      try {
        const response = await axios.get(`${apiUrl.value}/api/pedidosPendientesTotales`);
        if (response.status === 200) {
          items.value = response.data.map(pedido => ({
            id: pedido.id,
            tipo: pedido.tipo,
            distrito: pedido.distrito,
            estado: pedido.estado,
            fecha: pedido.fecha,
            ruta_id: pedido.ruta_id,
            total: pedido.total,
            direccion: pedido.direccion
          }));
        }
      } catch (error) {
        console.error('Failed to load pedidos:', error);
        showMessage('No se pudieron cargar los pedidos', 'error');
      }
    };


    const fetchPedidosProceso = async () => {
      try {
        const response = await axios.get(`${apiUrl.value}/api/pedidosDesktop`);
        if (response.status === 200) {
          enproceso.value = response.data.map(pedido => ({
            id: pedido.id,
            tipo: pedido.tipo,
            distrito: pedido.distrito,
            estado: pedido.estado,
            fecha: pedido.fecha,
            ruta_id: pedido.ruta_id,
            total: pedido.total,
            direccion: pedido.direccion
          }));
        }
      } catch (error) {
        console.error('Failed to load pedidos:', error);
        showMessage('No se pudieron cargar los pedidos', 'error');
      }
    };


    const fetchConductores = async () => {
      try {
        const response = await axios.get(`${apiUrl.value}/api/user_conductores`);
        if (response.status === 200) {
          conductores.value = response.data.map(data => ({
            id: data.id,
            nombre: `${data.nombres} ${data.apellidos}`,
            estado: data.estado
          }));
        }
      } catch (error) {
        console.error('Failed to load conductores:', error);
        showMessage('No se pudieron cargar los conductores', 'error');
      }
    };

    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    };

    const showMessage = (text, color = 'success') => {
      snackbar.value.text = text;
      snackbar.value.color = color;
      snackbar.value.show = true;
    };

    const updateSelectedPedidos = (newSelection) => {
      // Aquí actualizas correctamente la selección
      selectedPedidos.value = newSelection;
    };

    const crearRutaPublica = async () => {
      //if (loading.value) return;

      try {
        // Iniciar el diálogo de progreso
        loading.value = true;
        //dialogProgress.value = true;
        //progress.value = 0;
        //statusMessage.value = 'Verificando pedidos seleccionados...';

        const pedidosSeleccionados = toRaw(selectedPedidos.value);

        if (!pedidosSeleccionados || pedidosSeleccionados.length === 0) {
          throw new Error('Debe seleccionar al menos un pedido');
        }

        //progress.value = 20;
        //statusMessage.value = 'Calculando distancia y tiempo...';

        const distancia = calcularDistancia();
        const tiempo = calcularTiempo();

        //progress.value = 40;
        //statusMessage.value = 'Creando nueva ruta...';

        // 1. Crear la ruta
        const rutaResponse = await axios.post(`${apiUrl.value}/api/ruta`, {
          distancia_km: distancia,
          tiempo_ruta: tiempo,
          fecha_creacion: new Date().toISOString()
        });

        //progress.value = 60;
        //statusMessage.value = 'Procesando ID de ruta...';

        const rutaId = rutaResponse.data.id;
        if (!rutaId) {
          throw new Error('No se pudo obtener el ID de la ruta creada');
        }

        //progress.value = 80;
        //statusMessage.value = 'Actualizando pedidos...';

        // 2. Actualizar pedidos
        const updatePromises = pedidosSeleccionados.map(pedido =>
          axios.put(`${apiUrl.value}/api/pedidoruta/${pedido.id}`, {
            ruta_id: rutaId,
            estado: 'en proceso'
          })
        );

        await Promise.all(updatePromises);

        //progress.value = 90;
        //statusMessage.value = 'Actualizando vista...';

        // 3. Recargar datos
        await fetchPedidos();
        await fetchPedidosProceso();
        resetSelections();
        loading.value = false; 
        //progress.value = 100;
        //statusMessage.value = '¡Ruta creada exitosamente!';
        
        showMessage('Ruta creada exitosamente');

        // Cerrar el diálogo después de un breve delay
        /*
        setTimeout(() => {
          dialogProgress.value = false;
          loading.value = false;
        }, 1500);*/

      } catch (error) {
        console.error('Error al crear ruta:', error);
        loading.value = false;
        //statusMessage.value = error.message || 'Error al crear la ruta';
        showMessage(error.message || 'Error al crear la ruta', 'error');
        //progress.value = 0;

        // Mantener el diálogo abierto en caso de error para mostrar el mensaje
        /*
        setTimeout(() => {
          dialogProgress.value = false;
          loading.value = false;
        }, 2000);*/
      }
    };


    const calcularDistancia = () => selectedPedidos.value.length * 5;
    const calcularTiempo = () => selectedPedidos.value.length * 10;

    const resetSelections = () => {
      selectedPedidos.value = [];
      selectedConductores.value = [];
    };

    const viewOrder = async (pedido) => {
      selectedOrder.value = pedido;
      await getDetalleXUnPedido(pedido.id);
      orderDialog.value = true;
    };

    const getDetalleXUnPedido = async (pedidoID) => {
      if (!pedidoID) return;

      try {
        const response = await axios.get(`${apiUrl.value}${api}${apiDetallePedido}${pedidoID}`);
        //if (response.status === 200) {
        const listTemporal = response.data.map(mapa => ({
          pedidoID: mapa.pedido_id,
          productoNombre: mapa.nombre_prod,
          cantidadProd: mapa.cantidad,
          promocionID: mapa.promocion_id,
          nombrePromo: mapa.nombre_promocion
        }));
        console.log("---------------> DETALLES PEDIDOS<--------------------");
        console.log(listTemporal);
        let detalles = listTemporal
          .map(detalle => {
            if (detalle.promocionID && detalle.nombrePromo) {
              // Si es una promoción, solo mostrar el nombre de la promoción
              return `${capitalize(detalle.nombrePromo)} x ${detalle.cantidadProd} uds.`;
            } else {
              // Si no es promoción, mostrar el producto y su cantidad
              return `${capitalize(detalle.productoNombre)} x ${detalle.cantidadProd} uds.`;
            }
          })
          .join('\n');

        productosYCantidadesPorPedido.value[pedidoID] = detalles;
        //}
      } catch (error) {
        console.error('Error al cargar los detalles del pedido:', error);
        alert('Error al cargar los detalles del pedido');
      }
    };

    const capitalize = (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const lastRutaPublica = async () => {
      try {
        console.log("RUTA-ADD----------------->")
        console.log(`${apiUrl.value}/api/rutalastAll`)
        const response = await axios.get(`${apiUrl.value}/api/rutalastAll`, {
          headers: { "Content-type": "application/json" },
        });
        console.log(rutaIdLastPublica.value)
        // Asigna el ID de la ruta desde la respuesta al valor de `rutaIdLastPublica`
        rutaIdLastPublica.value = response.data.id ?? 0;
      } catch (error) {
        console.error('Error fetching last public route:', error);
      }
    };

    const addToRoute = async (pedido) => {
      try {
        if (!rutaIdLastPublica.value) {

          //const distancia = 5;
          //const tiempo = 10;

          console.log("ENTRANDO A ADDROUTE");
          //console.log(rutaIdLastPublica.value);
          console.log(`${pedido.id}`);

          /*
          const rutaResponse = await axios.get(`${apiBaseUrl}/api/rutalastAll`, {
            distancia_km: distancia,
            tiempo_ruta: tiempo,
            fecha_creacion: new Date().toISOString()
          });*/
          await lastRutaPublica();

          if (!rutaIdLastPublica.value) {
            throw new Error('No se pudo obtener la última ruta pública');
          }
          //rutaIdLastPublica.value = rutaResponse.data.id;
        }


        await axios.put(`${apiUrl.value}/api/pedidoruta/${pedido.id}`, {
          ruta_id: rutaIdLastPublica.value,
          estado: 'en proceso'
        });

        showMessage(`Pedido ${pedido.id} agregado a la ruta`);
        await fetchPedidos();
        await fetchPedidosProceso();
      } catch (error) {
        console.error('Error adding order to route:', error);
        showMessage('Error al agregar pedido a la ruta', 'error');
      }
    };

    const deletePedido = async (pedido) => {
      try {
        console.log("Entrando a Eliminar Ruta");
        console.log(`${pedido.id}`);

        const response = await axios.delete(`${apiUrl.value}/api/revertirpedido/${pedido.id}`);
        if (response.status === 200) {
          showMessage('Pedido eliminado correctamente');
          await fetchPedidos();
          await fetchPedidosProceso();
        }


      } catch (error) {
        console.error('Error al eliminar pedido:', error);
        showMessage('Error al eliminar pedido', 'error');
      }
    };

    onMounted(() => {
      fetchPedidos();
      fetchPedidosProceso();
      fetchConductores();
      lastRutaPublica();
      console.log('API URL from env:', process.env.VUE_APP_API_URL)
      console.log('API URL from ref:', apiUrl.value)
    });

    return {
      search,
      searchConductores,
      searchProceso,
      selectedPedidos,
      selectedConductores,
      items,
      conductores,
      enproceso,
      orderDialog,
      selectedOrder,
      productosYCantidadesPorPedido,
      loading,
      snackbar,
      headers,
      conductoresHeaders,
      fetchPedidos,
      fetchPedidosProceso,
      fetchConductores,
      formatDate,
      showMessage,
      crearRutaPublica,
      viewOrder,
      addToRoute,
      deletePedido,
      rutaIdLastPublica,
      updateSelectedPedidos,
      getGoogleMapsLink,
      //dialogProgress,
      //progress,
      //statusMessage,
    };
  }
};
</script>



<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.btn-large {
  padding: 16px 40px;
  /* Reduce ligeramente el padding vertical para mejor centrado */
  font-size: 18px;
  min-width: 400px;
  margin-bottom: 48px;
  margin-top: 80px;
  line-height: 1.2;
  /* Ajusta la altura de línea para mejor centrado */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  /* Alinea el texto verticalmente en el centro */
  justify-content: center;
  /* Centra el texto horizontalmente */
  transition: background-color 0.3s ease, transform 0.2s ease;
}

/* Efecto hover para el botón */
.btn-large:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.alineartexto {
  text-align: left;
  font-style: inherit;
  font-weight: bold;
  font-size: medium;
}

.pedidos-pendientes {
  background-color: #FFA07A;

  /* Salmón suave */
}

.pedidos-en-proceso {
  background-color: #1bdd34;
  
  /* Amarillo dorado */
}

.conductores {
  background-color: #FFD700;
  
  /* Verde claro */
}

.pedidos-pendientes-table {
  background-color: #f38c7a;
  /* Tomate vibrante */
}

.pedidos-en-proceso-table {
  background-color: #73f184;
  /* Amarillo pastel */
}

.conductores-table {
  background-color: #f8e792;
  /* Verde suave */
}
</style>
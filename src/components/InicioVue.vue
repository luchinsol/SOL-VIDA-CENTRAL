<template>


    <!-- PEDIDOS -->
    <v-row>
        <v-col cols="12" class="alineartexto">
            <p style="margin-left: 20px;">Pedidos</p>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" md="4" lg="4">
            <v-card elevation="8" style="background-color:royalblue;" class="tarjetas-headers">
                <v-card-title style="color:white;font-weight:bold">
                    Entregados
                </v-card-title>
                <v-row>
                    <v-col cols="6">
                        <v-card-text class="tarjetatexto" style="color:white">
                            {{ pedidosEntregadosCount }} pedidos
                        </v-card-text>

                    </v-col>
                    <v-col cols="6">
                        <v-img class="imagen-card" :src="require('@/assets/entregados.png')"></v-img>
                    </v-col>
                </v-row>



            </v-card>
        </v-col>
        <v-col cols="12" md="4" lg="4">
            <v-card elevation="8" style="background-color:cadetblue;" class="tarjetas-headers">
                <v-card-title style="color:white; font-weight:bold;">
                    Procesos
                </v-card-title>
                <v-row>
                    <v-col cols="6">
                        <v-card-text class="tarjetatexto" style="color:white">
                            {{ pedidosProceso }} pedidos
                        </v-card-text>

                    </v-col>
                    <v-col cols="6">
                        <v-img class="imagen-card" :src="require('@/assets/procesos.png')"></v-img>
                    </v-col>
                </v-row>

            </v-card>
        </v-col>
        <v-col cols="12" md="4" lg="4">
            <v-card elevation="8" style="background-color:darkseagreen;">
                <v-card-title style="color:white;font-weight:bold;">
                    Pendientes
                </v-card-title>
                <v-row>
                    <v-col cols="6">
                        <v-card-text class="tarjetatexto" style="color:white">
                             {{ pedidosPendientesCount }} pedidos
                        </v-card-text>
                    </v-col>
                    <v-col cols="6">
                        <v-img class="imagen-card" :src="require('@/assets/pendientes.png')"></v-img>
                    </v-col>
                </v-row>


            </v-card>
        </v-col>
    </v-row>

    <!-- CLIENTES MONTOS -->
    <v-row>
        <v-col cols="6" class="alineartexto">
            <p>Clientes nuevos</p>
        </v-col>
        <v-col cols="6" class="alineartexto">
            <p>Montos</p>
        </v-col>
    </v-row>

    <v-row>
        <v-col cols="6">
            <v-card elevation="8" class="clientes">

                <v-data-table style="background-color:steelblue; color:white" :headers="headers" :items="items"
                    item-key="id" :items-per-page="2">
                    <template v-slot:[`column.header.name`]="{ headers }">
                        <span class="custom-header">{{ headers.title }}</span>
                    </template>
                </v-data-table>

            </v-card>
        </v-col>
        <v-col cols="3">
    <v-card elevation="8" class="montotarjeta" style="background-color:cadetblue;">
      <v-card-title>
        Monto Entregados
      </v-card-title>
      <v-img class="ima-montos" :src="require('@/assets/calculadora.png')"></v-img>
      <p class="monto-texto" v-if="isLoading">Cargando...</p>
      <p class="monto-texto" v-else-if="pedidosEntregados !== null">
         {{ formatNumber(pedidosEntregados) }}
      </p>
      <p class="monto-texto" v-else>Error al cargar datos</p>
    </v-card>
  </v-col>
        <v-col cols="3">
            <v-card elevation="8" class="montotarjeta" style="background-color:cadetblue;">
                <v-card-title>
                    Monto Pendientes
                </v-card-title>
                <v-img class="ima-montos" :src="require('@/assets/hoja.png')"></v-img>
                <p class="monto-texto">{{ formatNumber(pedidosPendientes) }}</p>
            </v-card>
        </v-col>
    </v-row>

    <!-- CONDUCTORES -->
    <v-row>
        <v-col cols="6" class="alineartexto">
            <p>Conductores</p>
        </v-col>
        <v-col cols="6" class="alineartexto">
            <p>Pedidos aceptados</p>
        </v-col>
    </v-row>

    <!-- CONDUCTORES - PEDIDOS -->
    <v-row>
        <v-col cols="6">
            <v-card elevation="8">
                <v-data-table class="tablacond" :headers="headersConductores" :items="conductores" item-key="id"
                    items-per-page="2"></v-data-table>
            </v-card>
        </v-col>

        <v-col cols="6">
            <v-card elevation="8">
                <v-data-table class="tablacond" :headers="headersPedidos" :items="pedidosAceptados" item-key="id"
                    items-per-page="2"></v-data-table>
            </v-card>
        </v-col>
    </v-row>

</template>

<script>
import axios from 'axios';
export default {
    name: 'Inicio',
    data() {
        return {
            apiUrl: process.env.VUE_APP_API_URL,
            headers: [
                { title: 'Nombre', key: 'nombre' },
                { title: 'Apellidos', key: 'apellidos' },
                { title: 'Email', key: 'email' },
                { title: 'Teléfono', key: 'telefono' },
                { title: 'Fecha de Creación Cuenta', key: 'fecha_creacion_cuenta' },
            ],
            items: [],
            conductores: [],
            headersConductores: [
                { title: 'ID', key: 'id' },
                { title: 'Usuario ID', key: 'usuario_id' },
                { title: 'Nombres', key: 'nombres' },
                { title: 'Apellidos', key: 'apellidos' },
                { title: 'DNI', key: 'dni' },
                { title: 'Estado', key: 'estado' },
                { title: 'Licencia', key: 'licencia' },
            ],
            pedidosAceptados: [],
            headersPedidos: [
                { title: 'ID', key: 'id' },
                { title: 'Nombres', key: 'nombre' },
                { title: 'Apellidos', key: 'apellidos' },
                { title: 'Estado', key: 'estado' },
                { title: 'Fecha', key: 'fecha' },
                { title: 'Total', key: 'total' },
            ],
            pedidosEntregados: null,
            pedidosPendientes: null,
            isLoading: true,
            pedidosEntregadosCount: 0,
            pedidosProceso: 0,
            pedidosPendientesCount: 0,
        };
    },
    mounted() {
        console.log('API URL:', this.apiUrl); // Para verificar la URL
        this.fetchUserData();
        this.fetchConductoresData();
        this.fetchPedidosAceptados();
        this.fetchPedidosEntregados();
        this.fetchPedidosPendientes();
        this.fetchPedidosEntregadosCount();
        this.fetchPedidosProcesoCount();
        this.fetchPedidosPendientesCount();
    },
    methods: {
        async fetchUserData() {
            try {
                const response = await axios.get(`${this.apiUrl}/api/user_cliente`);
                this.items = response.data;
                console.log('Datos recibidos:', this.items);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        },
        async fetchConductoresData() {
            try {
                const response = await axios.get(`${this.apiUrl}/api/user_conductores`);
                this.conductores = response.data;
                console.log('Datos de conductores recibidos:', this.conductores);
            } catch (error) {
                console.error('Error obteniendo datos de conductores:', error);
            }
        },

        async fetchPedidosAceptados() {
            try {
                const response = await axios.get(`${this.apiUrl}/api/pedidosDesktop`);
                this.pedidosAceptados = response.data.filter(pedido => pedido.estado === 'en proceso');
                console.log('Pedidos aceptados recibidos:', this.pedidosAceptados);
            } catch (error) {
                console.error('Error obteniendo datos de pedidos:', error);
            }
        },

        async fetchPedidosEntregados() {
      try {
        this.isLoading = true;
        const response = await axios.get(`${this.apiUrl}/api/pedidosEntregados`);
        console.log('Respuesta completa de la API:', response.data);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const { total_pedidos_entregados } = response.data[0];
          if (total_pedidos_entregados !== undefined) {
            this.pedidosEntregados = parseFloat(total_pedidos_entregados);
            console.log('Valor final de pedidosEntregados:', this.pedidosEntregados);
          } else {
            console.warn('No se encontró total_pedidos_entregados en los datos');
            this.pedidosEntregados = null;
          }
        } else {
          console.warn('La estructura de datos no es la esperada');
          this.pedidosEntregados = null;
        }
      } catch (error) {
        console.error('Error obteniendo pedidos entregados:', error);
        this.pedidosEntregados = null;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPedidosPendientes() {
      try {
        this.isLoading = true;
        const response = await axios.get(`${this.apiUrl}/api/pedidosPendientes`);
        console.log('Respuesta completa de la API:', response.data);
        const { total_pedidos_entregados } = response.data[0]; // Cambiado de total_pedidos_pendientes a total_pedidos_entregados
        this.pedidosPendientes = parseFloat(total_pedidos_entregados);
      } catch (error) {
        console.error('Error obteniendo pedidos pendientes:', error);
        this.pedidosPendientes = null;
      } finally {
        this.isLoading = false;
      }
    },
    formatNumber(value) {
      if (value === null || isNaN(value)) return 'N/A';
      return new Intl.NumberFormat('es-PE', { 
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(value);
    },
    async fetchPedidosEntregadosCount() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/pedidosConteoEntregado`);
        console.log('Respuesta de la API:', response.data);
        this.pedidosEntregadosCount = parseInt(response.data[0].total_pedidos_entregados, 10);
      } catch (error) {
        console.error('Error al obtener pedidos entregados:', error);
        this.pedidosEntregadosCount = 0;
      }
    },
    async fetchPedidosProcesoCount() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/pedidosConteoProceso`);
        console.log('Respuesta de la API (Pedidos en Proceso):', response.data);
        this.pedidosProceso = parseInt(response.data[0].total_pedidos_proceso, 10);
      } catch (error) {
        console.error('Error al obtener pedidos en proceso:', error);
        this.pedidosProceso = 0;
      }
    },
    async fetchPedidosPendientesCount() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/pedidosConteoPendiente`);
        console.log('Respuesta de la API (Pedidos Pendientes):', response.data);
        this.pedidosPendientesCount = parseInt(response.data[0].total_pedidos_pendiente, 10);
      } catch (error) {
        console.error('Error al obtener pedidos pendientes:', error);
        this.pedidosPendientesCount = 0;
      }
    },
  },
}
</script>
<style scoped>
.tablacond {
    background-color: #404549;
    color: white;
}

.tarjetatexto {
    font-size: 45px;
    text-align: end;
    justify-content: right;
    white-space: nowrap;
    /* Evitar que el texto se divida */
}



.alineartexto {
    text-align: left;
    font-style: inherit;
    font-weight: bold;
    font-size: xx-large;
}

.montotarjeta {
    min-height: 225px;
    color: #ffffff;
}

.monto-texto {
    font-weight: bold;
    font-size: 30px;
}

.ima-montos {
    height: 90px;
    object-fit: cover;
}

.tablasdata {
    color: #4A90E2;
}
</style>
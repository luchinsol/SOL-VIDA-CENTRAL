<template>
  <div>
    <!--TITULO PEDIDO-->
    <v-row>
      <v-col cols="4" class="alineartexto">
        <p style="margin-left: 20px;">Gestión De Pedidos Pendientes</p>
      </v-col>
      <v-col cols="4" class="alineartexto">
        <p style="margin-left: 20px;">Gestión De Pedidos En Proceso</p>
      </v-col>
      <v-col cols="4" class="alineartexto">
        <p style="margin-left: 20px;">Clientes Beneficiados</p>
      </v-col>
    </v-row>

    <!--TABLA-->
    <v-row>
      <v-col cols="4">
        <v-card>
          <v-card-title>
            <v-text-field v-model="search" label="Buscar Pendientes" prepend-inner-icon="mdi-magnify" single-line
              hide-details></v-text-field>
          </v-card-title>
          <v-data-table :headers="headers" :items="pedidos" show-expand single-expand :search="search"
            :items-per-page="3">
            <!-- Slot para personalizar la fila completa -->
            <template v-slot:item="{ item }">
              <tr :class="{ 'highlight-row': item.beneficiado_nombre && item.beneficiado_apellidos }">
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>
                  <a :href="getWhatsAppLink(item.telefono)" target="_blank">{{ item.telefono }}</a>
                </td>
                <td>
                  <!-- Dirección con truncamiento -->
                  <div class="text-truncate"
                    style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <a :href="getGoogleMapsLink(item.direccion)" target="_blank">{{ item.direccion }}</a>
                  </div>
                </td>
                <td>{{ item.total }}</td>
                <td>
                  <v-chip :color="getEstadoColor(item.estado)">{{ item.estado }}</v-chip>
                </td>
                <td>{{ item.fecha }}</td>
                <td>{{ item.beneficiado_nombre }}</td>
                <td>{{ item.beneficiado_apellidos }}</td>
                <td style="width: 180px; display: flex; justify-content: space-evenly;">
                  <!-- Ajuste con margen superior -->
                  <v-icon small class="mr-2" @click="viewOrder(item)" style="font-size: 1.3rem; margin-top: 15px;">
                    mdi-eye
                  </v-icon>
                  <v-icon small class="mr-2" @click="openEditDialog(item)"
                    style="font-size: 1.3rem; margin-top: 15px;">mdi-pencil</v-icon>
                  <v-icon small class="mr-2" @click="deleteItem(item)" style="font-size: 1.3rem; margin-top: 15px;">
                    mdi-delete
                  </v-icon>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-col>


      <!-- Diálogo de edición mejorado -->
      <v-dialog v-model="dialogoVisible" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Editar Pedido</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="pedidoEditado.total" label="Total" type="number" prefix="S/."></v-text-field>
                </v-col>

                <!-- Campo de fecha corregido -->
                <v-col cols="12">
                  <v-menu v-model="menuFecha" :close-on-content-click="false" transition="scale-transition" offset-y>
                    <!-- Campo de texto que activa el calendario -->
                    <template v-slot:activator="{ on, props }">
                      <v-text-field v-model="pedidoEditado.fecha" label="Fecha del Pedido" prepend-icon="mdi-calendar"
                        v-bind="props" v-on="on"></v-text-field>
                    </template>

                    <!-- Componente de calendario para selección de año, mes y día -->
                    <v-date-picker v-model="pedidoEditado.fecha" @input="menuFecha = false"
                      :max="new Date().toISOString().substr(0, 10)" :year="true" :month="true"></v-date-picker>
                  </v-menu>
                </v-col>



                <v-col cols="12">
                  <v-select v-model="pedidoEditado.estado" :items="estadosDisponibles" label="Estado"
                    required></v-select>
                </v-col>

                <v-col cols="12">
                  <v-textarea v-model="pedidoEditado.observacion" label="Observación" rows="3"></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="cerrarDialogo">
              Cancelar
            </v-btn>
            <v-btn color="success" text @click="guardarCambios">
              Guardar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <!-- DIALOGO DE DETALLES DEL PEDIDO -->
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


      <!-- Diálogo de eliminación -->
      <v-dialog v-model="deleteDialog" persistent max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Eliminar Pedido</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <p>¿Está seguro que desea eliminar este pedido?</p>
                </v-col>

                <v-col cols="12">
                  <v-textarea v-model="motivoEliminacion" label="Observación" rows="3" required
                    :rules="[v => !!v || 'La observación es requerida']"></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="cerrarDialogoEliminar">
              Cancelar
            </v-btn>
            <v-btn color="success" text @click="confirmarEliminacion" :disabled="!motivoEliminacion">
              Eliminar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-col cols="4">
        <v-card>
          <v-card-title>
            <v-text-field v-model="searchPedido" label="Buscar En Proceso" prepend-inner-icon="mdi-magnify" single-line
              hide-details></v-text-field>
          </v-card-title>
          <v-data-table :headers="pedidoHeaders" :items="pedidosproc" :search="searchPedido" :items-per-page="3"
            :sort-by="[{ key: 'id', order: 'desc' }]">
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ item.apellidos }}</td>
                <td>
                  <a :href="getWhatsAppLink(item.telefono)" target="_blank">{{ item.telefono }}</a>
                </td>
                <td>{{ item.total }}</td>
                <td>{{ item.ruta_id }}</td>
                <td>{{ item.fecha }}</td>
                <td>{{ item.estado }}</td>
                <td>{{ item.tipo }}</td>
                <td>
                  <!-- Dirección con truncamiento -->
                  <div class="text-truncate"
                    style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <a :href="getGoogleMapsLink(item.direccion)" target="_blank">{{ item.direccion }}</a>
                  </div>
                </td>
                <td>{{ item.distrito }}</td>
                <td style="width: 180px; display: flex; justify-content: space-evenly;">
                  <!-- Ajuste con margen superior -->
                  <v-icon small class="mr-2" @click="viewOrder(item)" style="font-size: 1.3rem; margin-top: 15px;">
                    mdi-eye
                  </v-icon>
                  <v-icon small class="mr-2" @click="openEditDialog(item)"
                    style="font-size: 1.3rem; margin-top: 15px;">mdi-pencil</v-icon>
                  <v-icon small class="mr-2" @click="deleteItem(item)" style="font-size: 1.3rem; margin-top: 15px;">
                    mdi-delete
                  </v-icon>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-col>



      <v-col cols="4">
        <v-card>
          <v-card-title>
            <v-text-field v-model="searchClient" label="Buscar Cliente" prepend-inner-icon="mdi-magnify" single-line
              hide-details></v-text-field>
          </v-card-title>
          <v-data-table :headers="clienteHeaders" :items="clientes" :search="searchClient" :items-per-page="5">
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ item.apellidos }}</td>
                <td>{{ item.telefono }}</td>
                <td>{{ item.saldo_beneficios }}</td>
                <td>
                  <v-chip :color="item.quiereretirar ? 'green' : 'red'">
                    {{ item.quiereretirar ? 'Sí' : 'No' }}
                  </v-chip>
                </td>
                <td>{{ item.banco_retiro }}</td>
                <td>{{ item.numero_cuenta }}</td>
                <td>
                  <v-icon small class="mr-2" @click="editClient(item)">mdi-pencil</v-icon>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

    </v-row>



    <!-- FORMULARIO -->
    <v-row>
      <v-col cols="12" md="12" lg="12">
        <v-card>
          <v-stepper v-model="activeStep" :items="['Cliente - Ubicación', 'Productos', '']">
            <!-- Contenido del primer paso -->
            <template v-slot:[`item.1`]>


              <v-row>
                <v-col cols="3">
                  <v-card elevation="5" class="mb-3 pa-2">
                    <v-card-title class="alineartexto">
                      Cliente
                    </v-card-title>
                    <v-text-field v-model="formData.nombre" label="Nombre"></v-text-field>
                    <v-text-field v-model="formData.apellidos" label="Apellidos"></v-text-field>
                    <v-text-field v-model="formData.telefono" label="Teléfono"></v-text-field>
                    <v-text-field v-model="formData.direccion" label="Dirección"></v-text-field>
                    <v-text-field v-model="formData.distrito" label="Distrito"></v-text-field>
                    <v-row class="pa-3">
                      <v-text-field v-model="formData.latitud" label="Latitud"></v-text-field>
                      <v-spacer></v-spacer>
                      <v-text-field v-model="formData.longitud" label="Longitud"></v-text-field>
                    </v-row>
                    <v-text-field v-model="formData.fechaPedido" label="Fecha de pedido"></v-text-field>
                  </v-card>


                </v-col>

                <v-col cols="9">
                  <v-card elevation="5" style="background-color: bisque;">
                    <v-card-title class="alineartexto">Mapa</v-card-title>
                    <v-text-field v-model="searchQuery" label="Busqueda" prepend-inner-icon="mdi-magnify"
                      @keyup.enter="searchLocation"></v-text-field>
                    <div id="map" style="height: 400px;"></div>
                    <!--<v-btn color="primary" @click="getAddress">Obtener dirección</v-btn>-!-->
                  </v-card>
                </v-col>
              </v-row>

            </template>

            <!-- Contenido del segundo paso -->
            <template v-slot:[`item.2`]>
              <v-card elevation="6">
                <v-row class="mb-5" v-for="(group, index) in [productos, promos]" :key="index">
                  <v-card>
                    <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                      <v-slide-group-item v-for="item in group" :key="item.id">
                        <v-card class="mx-auto mb-5 ml-5 pa-3" max-width="400" min-width="300">
                          <v-img class="align-end text-white" height="200" :src="item.foto" cover></v-img>



                          <v-card-subtitle class="pt-4">
                            {{ item.nombre }}
                          </v-card-subtitle>

                          <v-card-text>
                            <div>S/. {{ item.precio.toFixed(2) }}</div>
                            <div>{{ item.descripcion }}</div>
                          </v-card-text>

                          <v-card-actions class="d-flex justify-center">
                            <v-btn icon="mdi-plus" @click="incrementQuantity(item)"></v-btn>
                            <p>{{ item.cantidad || 0 }}</p>
                            <v-btn icon="mdi-minus" @click="decrementQuantity(item)"></v-btn>
                          </v-card-actions>
                          <v-text-field v-model="item.descuento" label="S/. Descuento" prefix="S/."></v-text-field>
                          <v-btn @click="confirmarItem(item)">Confirmar</v-btn>


                        </v-card>
                      </v-slide-group-item>
                    </v-slide-group>
                  </v-card>
                  <v-dialog v-model="dialog" width="auto">
                    <v-card min-width="400" prepend-icon="mdi-account">
                      <v-text-field v-model="autorizadoPor" label="Autorizado por:"></v-text-field>
                      <v-text-field v-model="cargo" label="Cargo:"></v-text-field>
                      <template v-slot:actions>
                        <v-btn class="ms-auto" text="Ok" @click="dialog = false"></v-btn>
                      </template>
                    </v-card>
                  </v-dialog>
                </v-row>


              </v-card>
            </template>



            <!-- Customización de botones -->
            <template v-slot:prev="">
              <v-btn text @click="prevs">Anterior</v-btn>
            </template>

            <v-dialog v-model="CircularProgress">
              <v-progress-circular color="red" indeterminate></v-progress-circular>
            </v-dialog>

            <template v-slot:next="">
              <v-btn text @click="nexts">
                {{ activeStep === 2 ? 'REGISTRAR PEDIDO' : 'Siguiente' }}
              </v-btn>
            </template>
            <!-- Modal integrado -->
            <v-dialog v-model="mostrarModalTipoPedido" max-width="400px">
              <v-card>
                <v-card-title class="text-h5">
                  Seleccione el tipo de pedido
                </v-card-title>

                <v-card-text>
                  <p class="mb-4">Por favor, seleccione el tipo de pedido que desea realizar:</p>
                  <v-select v-model="tipoPedidoSeleccionado" :items="tiposPedido" item-title="text" item-value="value"
                    label="Tipo de Pedido" required></v-select>

                  <div v-if="tipoPedidoSeleccionado === 'express'" class="mt-4 text-subtitle-1">
                    Se aplicará un cargo adicional de S/.4.00 por servicio express
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" variant="text" @click="cerrarModal">
                    Cancelar
                  </v-btn>
                  <v-btn color="primary" variant="text" @click="procesarPedido" :disabled="!tipoPedidoSeleccionado">
                    Confirmar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Diálogo -->
    <v-dialog v-model="dialogCircular" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Cargando...
        </v-card-title>
        <v-card-text class="d-flex justify-center">
          <!-- Circular Progress -->
          <v-progress-circular indeterminate color="primary" />
        </v-card-text>
      </v-card>
    </v-dialog>

          </v-stepper>

        </v-card>
      </v-col>
    </v-row>


    <v-dialog v-model="dialogSaldo" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Confirmación de Transferencia</span>
        </v-card-title>

        <v-card-text>
          <!-- Mostrar el mensaje con los detalles de la transferencia -->
          <p>{{ dialogMessage }}</p>

          <!-- Aquí podrías mostrar más detalles si es necesario -->
          <v-form>
            <v-text-field v-model="editedItem.nombre" label="Nombre" readonly></v-text-field>

            <v-text-field v-model="editedItem.apellidos" label="Apellidos" readonly></v-text-field>

            <v-text-field v-model="editedItem.telefono" label="Teléfono" readonly></v-text-field>

            <v-text-field v-model="editedItem.saldo_beneficios" label="Saldo Beneficios" type="number"
              readonly></v-text-field>

            <v-text-field v-model="editedItem.banco_retiro" label="Banco de Retiro" readonly></v-text-field>

            <v-text-field v-model="editedItem.numero_cuenta" label="Número de Cuenta" readonly></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <!-- Botón de Cancelar -->
          <v-btn color="blue" text @click="dialogSaldo = false">Salir</v-btn>

          <!-- Botón de Aceptar, que actualiza la información -->
          <v-btn color="blue darken-1" text @click="updateClient">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>





    <!-- DIÁLOGOS -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title>¿Está seguro de que desea eliminar este pedido?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete">Cancelar</v-btn>
          <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogConfirm" width="auto">
      <v-card min-width="400" prepend-icon="mdi-account">
        <v-text-field v-model="confirmData.autorizado" label="Autorizado por:"></v-text-field>
        <v-text-field v-model="confirmData.cargo" label="Cargo:"></v-text-field>
        <template v-slot:actions>
          <v-btn class="ms-auto" text="Ok" @click="confirmProductDiscount"></v-btn>
        </template>
      </v-card>
    </v-dialog>


  </div>
</template>
<script>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';

export default {
  name: 'Gestion',
  setup() {
    const empleadoID = ref(1); // You should set this based on your authentication system
    const formKey = ref(null);
    const dialog = ref(false);
    const model = ref(null);
    const model1 = ref(null);
    const activeStep = ref(1);
    const editedIndex = ref(-1);
    const search = ref('');
    const searchQuery = ref('');
    const editedItem = ref({});
    const pedidoEditado = ref({
      id: null,
      total: '',
      fecha: '',
      estado: '',
      observacion: ''
    });

    const menuFecha = ref(false);
    const pedidos = ref([]);
    const pedidosproc = ref([]);
    const step = ref(1);
    const dialogDelete = ref(false);
    const dialogSaldo = ref(false);
    const map = ref(null);
    const marker = ref(null);
    const productos = ref([]);
    const promos = ref([]);
    //const cargo = ref('');
    //const apiUrl = 'http://147.182.251.164/api';
    //const apiUrl = 'http://127.0.0.1:4000/api';
    const apiUrl = ref(process.env.VUE_APP_API_URL)
    const api = '/api';
    const apiDetallePedido = '/detallepedidopromo/';
    const listSeleccionados = ref([]);
    const listPromosSeleccionadas = ref([]);
    const listFinalProductosSeleccionados = ref([]);
    const listFinalProductosSeleccionadosConDSCT = ref([]);
    const descuentoTotalPedido = ref(0);
    const montoTotalPedido = ref(0);
    const observacionFinal = ref('');
    const lastClienteNR = ref(null);
    const lastUbic = ref(null);
    const tipo = ref('normal');
    const estadoPedido = ref('pendiente');
    const dialogConfirm = ref(false);
    const mostrarModalTipoPedido = ref(false);
    const montoTotalOriginal = ref(0);
    const dialogMessage = ref('');
    const dialogoVisible = ref(false);
    const deleteDialog = ref(false);
    const motivoEliminacion = ref('');
    const pedidoAEliminar = ref(null);
    const autorizadoPor = ref('');
    const cargo = ref('');
    const tipoPedidoSeleccionado = ref(null);
    const orderDialog = ref(false);
    const selectedOrder = ref(null);
    const productosYCantidadesPorPedido = ref({});
    const dialogCircular = ref(false);

// Función para abrir el diálogo
const openDialog = () => {
  dialogCircular.value = true;

  // Simulación de carga (3 segundos)
  setTimeout(() => {
    dialogCircular.value = false;
  }, 1500);
};

// Función para cerrar el diálogo manualmente
const closeDialog = () => {
  dialogCircular.value = false;
};

    // Opciones del dropdown
    const tiposPedido = [
      { text: 'Normal (+ S/.0.00)', value: 'normal' },
      { text: 'Express (+ S/.4.00)', value: 'express' }
    ];


    const estadosDisponibles = [
      'pendiente',
      'en proceso',
      'anulado'
    ];


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

    

    const openEditDialog = (item) => {
      pedidoEditado.value = {
        id: item.id,
        total: item.total,
        fecha: item.fecha,
        estado: item.estado,
        observacion: item.observacion || ''
      };
      dialogoVisible.value = true;
    };

    const cerrarDialogo = () => {
      dialogoVisible.value = false;
      pedidoEditado.value = {};
    };

    const guardarCambios = async () => {
      try {
        const pedidoID = pedidoEditado.value.id;

        // Crear newDatos incluyendo todos los campos necesarios
        const newDatos = {
          totalpago: parseFloat(pedidoEditado.value.total), // Asegurarse que sea número
          fechaped: pedidoEditado.value.fecha, // Incluir la fecha
          estadoped: pedidoEditado.value.estado,
          observacion: pedidoEditado.value.observacion || 'NA' // Valor por defecto si es null
        };

        const response = await axios.put(
          `${apiUrl.value}/api/pedidoModificado/${pedidoID}`,
          newDatos, // axios maneja automáticamente la conversión a JSON
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          console.log('Pedido actualizado correctamente');
          await fetchPedidos();
          await fetchPedidosProceso(); // Refrescar datos después de actualizar
          cerrarDialogo();
        }
      } catch (error) {
        console.error('Error al actualizar pedido:', error);
        alert('Error al actualizar el pedido');
      }
    };

    // Método para abrir el diálogo de eliminación
    const deleteItem = (item) => {
      console.log('Abriendo diálogo para:', item);
      pedidoAEliminar.value = item;
      motivoEliminacion.value = '';
      deleteDialog.value = true;
    };
    const cerrarDialogoEliminar = () => {
      console.log('Cerrando diálogo'); // Debug log
      deleteDialog.value = false;
      pedidoAEliminar.value = null;
      motivoEliminacion.value = '';
    };

    const deletePedido = async (pedidoId, motivo) => {
      try {
        const response = await axios.delete(
          `${apiUrl.value}/api/revertirpedidocan/${pedidoId}`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            data: { motivoped: motivo }
          }
        );

        if (response.status === 200) {
          console.log('Pedido eliminado correctamente');
          await fetchPedidos();
          await fetchPedidosProceso();// Llama a la función para actualizar la lista de pedidos
        }
      } catch (error) {
        console.error('Error al eliminar pedido:', error);
        alert('Error al eliminar el pedido');
      }
    };

    const confirmarEliminacion = async () => {
      try {
        if (pedidoAEliminar.value && motivoEliminacion.value) {
          await deletePedido(pedidoAEliminar.value.id, motivoEliminacion.value);
          cerrarDialogoEliminar();
        }
      } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        alert('Error al eliminar el pedido');
      }
    };

    const mostrarModalSeleccionTipo = () => {
      montoTotalOriginal.value = montoTotalPedido.value; // Guardar el monto original
      mostrarModalTipoPedido.value = true;
    };

    const headers = [
      {
        title: 'ID', key: 'id',
        align: 'center',
        cellAlign: 'center'
      },           // Cambiado de 'text' a 'title' y 'value' a 'key'
      {
        title: 'Nombre', key: 'nombre',
        align: 'center',
        cellAlign: 'center'
      },
      {
        title: 'Teléfono', key: 'telefono',
        align: 'center',
        cellAlign: 'center'
      },
      {
        title: 'Dirección', key: 'direccion',
        align: 'center',
        cellAlign: 'center'
      },
      {
        title: 'Total', key: 'total',
        align: 'center',
        cellAlign: 'center'
      },
      {
        title: 'Estado', key: 'estado',
        align: 'center',
        cellAlign: 'center'
      },
      {
        title: 'Fecha', key: 'fecha',
        align: 'center',
        cellAlign: 'center'
      },
      {
        title: 'Beneficiado Nombre', key: 'beneficiado_nombre',
        align: 'center',
        cellAlign: 'center'
      },
      {
        title: 'Beneficiado Apellido', key: 'beneficiado_apellidos',
        align: 'center',
        cellAlign: 'center'
      },
      {
        title: 'Acciones', key: 'actions', align: 'center',
        cellAlign: 'center', sortable: false
      },
    ];


    const clienteHeaders = ref([
      { title: 'ID', key: 'id', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Nombre', key: 'nombre', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Apellidos', key: 'apellidos', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Teléfono', key: 'telefono', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Saldo Beneficios', key: 'saldo_beneficios', align: 'center', cellAlign: 'center', sortable: true },
      { title: '¿Retirar?', key: 'quiereretirar', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Banco de Retiro', key: 'banco_retiro', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Número de Cuenta', key: 'numero_cuenta', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Acciones', key: 'actions', align: 'center', cellAlign: 'center', sortable: false },
    ]);

    const clientes = ref([]);
    const searchClient = ref('');
    const searchPedido = ref('');

    const pedidoHeaders = ref([
      { title: 'ID', key: 'id', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Nombre', key: 'nombre', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Apellidos', key: 'apellidos', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Teléfono', key: 'telefono', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Total', key: 'total', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Ruta', key: 'ruta_id', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Fecha', key: 'fecha', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Estado', key: 'estado', align: 'center', cellAlign: 'center', sortable: true },
      { title: 'Tipo', key: 'tipo', align: 'center', cellAlign: 'center', sortable: false },
      { title: 'Dirección', key: 'direccion', align: 'center', cellAlign: 'center', sortable: false },
      { title: 'Distrito', key: 'distrito', align: 'center', cellAlign: 'center', sortable: false },
      { title: 'Acciones', key: 'actions', align: 'center', cellAlign: 'center', sortable: false },
    ]);

    const items = [
    ];


    const products = ref([
    ]);


    const formData = reactive({
      nombre: '',
      apellidos: '',
      telefono: '',
      direccion: '',
      distrito: '',
      latitud: '',
      longitud: '',
      email: '',
      ruc: '',
      fechaPedido: new Date().toISOString().slice(0, 10)
    });

    const confirmData = reactive({
      autorizado: '',
      cargo: ''
    });




    const getImageUrl = (filename) => {
      if (!filename) return 'https://via.placeholder.com/150?text=No+Image';
      return `${apiUrl.value}/images/${encodeURIComponent(filename)}`;
    };

    const getProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl.value}${api}/products`);
        productos.value = response.data.map((product) => ({
          ...product,
          foto: getImageUrl(product.foto),
          cantidad: 0,
          descuento: 0,
        }));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const getPromos = async () => {
      try {
        const response = await axios.get(`${apiUrl.value}${api}/promocion`);
        promos.value = response.data.map((promo) => ({
          ...promo,
          foto: getImageUrl(promo.foto),
          cantidad: 0,
          descuento: 0,
        }));
      } catch (error) {
        console.error('Error fetching promos:', error);
      }
    };


    const getProductoDePromo = async (cantidadProm, nombre, descripcion, descuento, promoID, precio) => {
      try {
        const response = await axios.get(`${apiUrl.value}${api}/productsbypromo/${promoID}`);
        const productosDePromo = response.data.map(product => ({
          id: product.producto_id,
          precio: parseFloat(precio),
          nombre: nombre,
          descripcion: descripcion,
          descuento: parseFloat(descuento),
          cantidad: parseInt(cantidadProm),
          observacion: `Promoción: ${nombre}`,
          promocion_id: promoID
        }));

        listFinalProductosSeleccionados.value.push(...productosDePromo);
      } catch (error) {
        console.error('Error al obtener productos de promoción:', error);
        throw error;
      }
    };

    /*
    const getLastClienteNrID = async () => {
          try {
            const response = await axios.get(`${apiUrl}/lastClienteNR/${empleadoID.value}`);
            if (response.status === 200 && response.data.length > 0) {
              lastClienteNR.value = response.data[0].id;
            } else {
              throw new Error('No client ID returned');
            }
          } catch (error) {
            console.error('Error getting last client ID:', error);
            throw new Error('Failed to get last client ID: ' + error.message);
          }
        };*/


    /*
    const getLastLocation = async () => {
      try {
        const response = await axios.get(`${apiUrl}/pedido_clientenr/${lastClienteNR.value}`);
        if (response.status === 200) {
          lastUbic.value = response.data.id;
          await updateLocationRelation(empleadoID.value, response.data.id);
        }
      } catch (error) {
        console.error('Error getting last location:', error);
        throw new Error('Failed to get last location: ' + error.message);
      }
    };*/
    // Función faltante para obtener última ubicación
    /*
    const lastUbi = async (clienteNRID, empleadoID) => {
      try {
        const res = await axios.get(`${apiUrl}/pedido_clientenr/${clienteNRID}`);
        if (res.status === 200) {
          lastUbic.value = res.data.id;
          await UpdateRelacionUbicacion(empleadoID, res.data.id);
        }
      } catch (e) {
        console.error('Error en la solicitud:', e);
      }
    };*/


    // Función para crear cliente no registrado
    const createNR = async () => {
      try {
        const response = await axios.post(`${apiUrl.value}${api}/clienteNR`, {
          empleado_id: empleadoID.value,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          direccion: formData.direccion,
          telefono: formData.telefono,
          email: formData.email,
          distrito: formData.distrito,
          latitud: formData.latitud,
          longitud: formData.longitud,
          ruc: formData.ruc
        });
        return response.data;
      } catch (error) {
        console.error('Error al crear cliente:', error);
        throw error;
      }
    };

    const updateLocationRelation = async (empleadoId, idRelacionUbicacion) => {
      try {
        const response = await axios.put(
          `${apiUrl.value}${api}/updateZonaTrabajo/${empleadoId}/${idRelacionUbicacion}`,
          {},
          {
            headers: {
              "Content-type": "application/json"
            }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error updating location relation:', error);
        throw error;
      }
    };

    // Función para crear pedido
    const createOrderDetails = async (clienteNrId) => {
      try {
        console.log('Iniciando creación de detalles de pedido');

        // Validar que tengamos un ID de cliente válido
        if (!clienteNrId) {
          throw new Error('ID de cliente no proporcionado');
        }

        // Crear los detalles uno por uno
        const detallesPendientes = [...listFinalProductosSeleccionados.value];
        const detallesCreados = [];

        while (detallesPendientes.length > 0) {
          const producto = detallesPendientes.shift();
          try {
            console.log('Creando detalle para producto:', producto);
            console.log('Creando detalle para producto:', producto.cantidad);
            console.log('Creando detalle para producto POSIBLE ERROR');
            console.log('Creando detalle para producto:', producto.promoID);
            console.log('Creando detalle para producto:', producto.promocion_id);
            console.log('Creando detalle para producto:', producto.id);
            console.log('Creando detalle para producto:', clienteNrId);


            const response = await axios.post(
              `${apiUrl.value}${api}/detallepedido`,
              {
                cliente_nr_id: clienteNrId,
                producto_id: producto.id,
                cantidad: producto.cantidadInt || producto.cantidad,
                promocion_id: producto.promoID || producto.promocion_id
              },
              {
                headers: {
                  "Content-type": "application/json"
                }
              }
            );

            if (response.status !== 200) {
              console.error('Error en la respuesta del servidor:', response.status);
              console.error('Detalles de la respuesta:', response.data);
              throw new Error(`Error del servidor: ${response.status}`);
            }

            console.log('Detalle creado exitosamente:', response.data);
            detallesCreados.push(response.data);
          } catch (error) {
            console.error('Error al crear detalle individual:', {
              producto: producto,
              error: error.message
            });
            detallesPendientes.push(producto); // Volver a intentar el detalle
          }
        }

        console.log('Todos los detalles fueron creados exitosamente');
        return detallesCreados;
      } catch (error) {
        console.error('Error en createOrderDetails:', error.message);
        throw new Error(`Error al crear detalles del pedido: ${error.message}`);
      }
    };

    // Obtiene el último cliente registrado
    const getLastClienteNR = async (empleadoID) => {
      try {
        const response = await axios.get(`${apiUrl.value}${api}/last_clientenr/${empleadoID}`);
        if (response.status === 200 && response.data.length > 0) {
          lastClienteNR.value = response.data[0].id;
          return lastClienteNR.value;
        } else {
          throw new Error("No se encontró un cliente no registrado.");
        }
      } catch (error) {
        console.error("Error al obtener el último cliente no registrado:", error);
        throw error;
      }
    };

    // Obtiene la última ubicación de cliente no registrado
    const getLastUbic = async (clienteNRID, empleadoID) => {
      try {
        const response = await axios.get(`${apiUrl.value}${api}/pedido_clientenr/${clienteNRID}`);
        if (response.status === 200 && response.data) {
          lastUbic.value = response.data.id;
          await updateRelacionUbicacion(empleadoID, lastUbic.value);
          return lastUbic.value;
        } else {
          throw new Error("No se encontró una ubicación para el cliente no registrado.");
        }
      } catch (error) {
        console.error("Error al obtener la última ubicación:", error);
        throw error;
      }
    };

    // Actualiza la relación de ubicación
    const updateRelacionUbicacion = async (empleadoID, idRelacionUbicacion) => {
      try {
        await axios.put(`${apiUrl.value}${api}/updateZonaTrabajo/${empleadoID}/${idRelacionUbicacion}`);
      } catch (error) {
        console.error("Error al actualizar la relación de ubicación:", error);
        throw error;
      }
    };


    const crearPedido = async () => {
      try {
        await calculoDeSeleccionadosYMontos();

        const clienteData = await createNR();
        lastClienteNR.value = clienteData.id;

        await getLastClienteNR(empleadoID.value);
        await getLastUbic(lastClienteNR.value, empleadoID.value);

        const fecha = new Date(formData.fechaPedido);
        const formattedDate = fecha.toISOString().split('T')[0];

        // Validar datos críticos
        if (!lastClienteNR.value) throw new Error('ID de cliente no disponible');
        if (!lastUbic.value) throw new Error('ID de ubicación no disponible');
        if (montoTotalPedido.value === undefined || isNaN(montoTotalPedido.value)) {
          throw new Error('Monto total inválido');
        }

        const pedidoData = {
          cliente_nr_id: parseInt(lastClienteNR.value),
          subtotal: parseFloat((montoTotalPedido.value + descuentoTotalPedido.value).toFixed(2)),
          descuento: parseFloat(descuentoTotalPedido.value.toFixed(2)),
          total: parseFloat(montoTotalPedido.value.toFixed(2)),
          fecha: formattedDate,
          tipo: tipo.value || 'normal',
          estado: estadoPedido.value || 'pendiente',
          observacion: observacionFinal.value || '',
          ubicacion_id: parseInt(lastUbic.value)
        };

        // Log para debugging
        console.log('Datos del pedido a enviar:', pedidoData);

        const pedidoResponse = await axios.post(`${apiUrl.value}${api}/pedido`, pedidoData);

        const detallesCreados = await createOrderDetails(lastClienteNR.value);
        
        if (detallesCreados.length === listFinalProductosSeleccionados.value.length) {
          resetearFormulario();
          resetearVistaSeleccionados();
          closeDialog();
          alert('¡Pedido registrado exitosamente!');
          await fetchPedidos();
          await fetchPedidosProceso();
          activeStep.value = 1;
          
          return true;
        } else {
          throw new Error('No se pudieron crear todos los detalles del pedido');
        }
      } catch (error) {
        console.error('Error al crear pedido:', error);
        closeDialog();
        alert(`Error al registrar el pedido: ${error.message}`);
        
        throw error;
      }
    };

    /*
        const validateForm = () => {
          return formData.nombre && 
                 formData.apellidos && 
                 formData.telefono && 
                 formData.direccion && 
                 formData.distrito;
        };
    
      */



    // Función para resetear el formulario
    const resetearFormulario = () => {
      Object.keys(formData).forEach(key => {
        formData[key] = '';
      });
      formData.fechaPedido = new Date().toISOString().slice(0, 10);
      listFinalProductosSeleccionados.value = [];
      montoTotalPedido.value = 0;
      descuentoTotalPedido.value = 0;
      observacionFinal.value = '';
    };

    const resetearVistaSeleccionados = () => {
      // Reiniciar los datos de cada producto y promoción en `productos` y `promos`
      productos.value.forEach((item) => {
        item.cantidad = 0; // Reinicia la cantidad a 0
        item.descuento = 0; // Reinicia el descuento a 0 o el valor inicial deseado
      });

      promos.value.forEach((item) => {
        item.cantidad = 0;
        item.descuento = 0;
      });

      // Reiniciar cualquier otra variable relacionada
      model.value = null; // Reinicia el modelo de selección del slide group
    };


    const incrementQuantity = (item) => {
      item.cantidad++;
    };

    const decrementQuantity = (item) => {
      if (item.cantidad > 0) {
        item.cantidad--;
      }
    };

    const confirmarItem = (item) => {
      if (item.descuento > 0) {
        item.autorizacion = {
          autorizadoPor: autorizadoPor.value,
          cargo: cargo.value,
          fecha: new Date().toISOString()
        };
      }
      dialog.value = true;
      //CRITERIO PROPIO DE COMENTAR ESTE FRAGMENTO DE CODIGO
      /*
      if (item.promoID) {
        getProductoDePromo(item);
      }
      */

      // Aquí puedes agregar la lógica para manejar la confirmación del item
      //trae los detalles
      calculoDeSeleccionadosYMontos();
    };




    const calculoDeSeleccionadosYMontos = async () => {
      // Resetear valores
      listSeleccionados.value = [];
      listPromosSeleccionadas.value = [];
      listFinalProductosSeleccionados.value = [];
      listFinalProductosSeleccionadosConDSCT.value = [];
      descuentoTotalPedido.value = 0;
      montoTotalPedido.value = 0;

      // Costo de envío
      const costoEnvio = tipoPedidoSeleccionado.value === 'express' ? 4.00 : 0.00;

      // Procesar productos y promos
      [...productos.value, ...promos.value].forEach(item => {
        if (item.cantidad > 0) {
          listSeleccionados.value.push(item);
          if (Object.prototype.hasOwnProperty.call(item, 'fecha_inicio')) {
            listPromosSeleccionadas.value.push(item);
          } else {
            listFinalProductosSeleccionados.value.push({
              ...item,
              precio: parseFloat(item.precio),
              descuento: parseFloat(item.descuento || 0),
              cantidad: parseInt(item.cantidad)
            });
          }
        }
      });

      // Procesar promociones
      for (const promo of listPromosSeleccionadas.value) {
        await getProductoDePromo(
          promo.cantidad,
          promo.nombre,
          promo.descripcion,
          promo.descuento,
          promo.id,
          promo.precio
        );
      }

      // Calcular totales
      let subtotalSinDescuento = 0;
      descuentoTotalPedido.value = 0;

      listFinalProductosSeleccionados.value.forEach(producto => {
        const precio = parseFloat(producto.precio) || 0;
        const cantidad = parseInt(producto.cantidad) || 0;
        const descuento = parseFloat(producto.descuento) || 0;

        subtotalSinDescuento += precio * cantidad;
        descuentoTotalPedido.value += descuento * cantidad;

        if (descuento > 0) {
          listFinalProductosSeleccionadosConDSCT.value.push({
            ...producto,
            precioConDescuento: precio - descuento
          });
        }
      });

      // Calcular monto total
      montoTotalPedido.value = subtotalSinDescuento - descuentoTotalPedido.value + costoEnvio;

      // Generar observación
      observacionFinal.value = listFinalProductosSeleccionadosConDSCT.value
        .map(item => {
          if (!item.observacion && !item.descuento) return null;

          const descuentoInfo = item.descuento > 0
            ? ` (Descuento: S/ ${(parseFloat(item.descuento) * parseInt(item.cantidad)).toFixed(2)})`
            : '';

          // Si hay descuento, incluir la información de autorización
          if (item.descuento > 0) {
            return `${item.nombre || ''}: ${item.observacion || ''}${descuentoInfo}\nAutorizado por: ${autorizadoPor.value}\nCargo: ${cargo.value}`;
          }

          return item.observacion;
        })
        .filter(Boolean)
        .join('\n\n'); // Agregamos un salto de línea adicional para mejor separación

      if (costoEnvio > 0) {
        observacionFinal.value += `\nEnvío Express: S/ ${costoEnvio.toFixed(2)}`;
      }
    };



    onMounted(() => {
      fetchPedidos();
      initMap();
      getProducts();
      getPromos();
      fetchClientes();
      fetchPedidosProceso();
    });

    const fetchPedidos = async () => {
      try {
        const response = await axios.get(`${apiUrl.value}/api/pedidosPendientesTotales`, {//'http://127.0.0.1:4000/api/pedidosDesktop',{//'http://147.182.251.164/api/pedidosDesktop', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          pedidos.value = response.data;
          console.log('Pedidos cargados:', pedidos.value);
        } else {
          throw new Error('No se recibieron datos');
        }
      } catch (err) {
        console.error('Error en fetchPedidos:', err);
      }
    };

    const fetchPedidosProceso = async () => {
      try {
        const response = await axios.get(`${apiUrl.value}/api/pedidosDesktop`, {//'http://127.0.0.1:4000/api/pedidosDesktop',{//'http://147.182.251.164/api/pedidosDesktop', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          pedidosproc.value = response.data;
          console.log('Pedidos cargados:', pedidosproc.value);
        } else {
          throw new Error('No se recibieron datos');
        }

      } catch (error) {
        console.error('Error en fetchProceso:', error);
      }

    };

    const fetchClientes = async () => {
      try {
        const response = await axios.get(`${apiUrl.value}/api/user_cliente_saldo`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          clientes.value = response.data; // Guardamos los datos de los clientes
          console.log('Clientes cargados:', clientes.value);
        } else {
          throw new Error('No se recibieron datos');
        }
      } catch (err) {
        console.error('Error en fetchClientes:', err);
      }
    };


    const initMap = () => {
      map.value = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([-77.042793, -12.046374]),
          zoom: 12
        })
      });

      const markerFeature = new Feature({
        geometry: new Point(fromLonLat([-77.042793, -12.046374]))
      });

      const markerStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        })
      });

      markerFeature.setStyle(markerStyle);

      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [markerFeature]
        })
      });

      map.value.addLayer(vectorLayer);
      marker.value = markerFeature;

      map.value.on('click', (event) => {
        const coords = toLonLat(event.coordinate);
        updateMarkerPosition(coords[1], coords[0]);
      });
    };

    const searchLocation = async () => {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}`);
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          updateMarkerPosition(parseFloat(lat), parseFloat(lon));
        }
      } catch (error) {
        console.error('Error searching location:', error);
      }
    };

    const updateMarkerPosition = (lat, lon) => {
      formData.latitud = lat.toFixed(6);
      formData.longitud = lon.toFixed(6);
      const newPosition = fromLonLat([lon, lat]);
      marker.value.getGeometry().setCoordinates(newPosition);
      map.value.getView().setCenter(newPosition);
      getAddress();
    };

    const getAddress = async () => {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${formData.latitud}&lon=${formData.longitud}`);
        if (response.data) {
          formData.direccion = response.data.display_name;
          formData.distrito = response.data.address.suburb || response.data.address.city_district || '';
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }
    };

    const getGoogleMapsLink = (direccion) => {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    };

    const getWhatsAppLink = (telefono) => {
      return `https://wa.me/${telefono}`;
    };

    const getEstadoColor = (estado) => {
      const colors = {
        'pendiente': 'orange',
        'en proceso': 'blue',
        'entregado': 'green',
        'cancelado': 'red'
      };
      return colors[estado.toLowerCase()] || 'grey';
    };


    const prevs = () => {
      if (activeStep.value > 1) {
        activeStep.value--;
      }
    };

    const nexts = async () => {
      if (activeStep.value === 2) {
        try {
          // Mostrar indicador de carga o deshabilitar el botón aquí si es necesario
          mostrarModalSeleccionTipo();
          // Intentar crear el pedido
          /*
          const success = await crearPedido();
          
          if (success) {
            // Mostrar mensaje de éxito
            alert('¡Pedido registrado exitosamente!');
            
            // Actualizar la lista de pedidos
            await fetchPedidos();
            
            // Resetear el formulario y volver al primer paso
            resetearFormulario();
            activeStep.value = 1;
          }*/
        } catch (error) {
          // Manejar errores
          console.error('Error al registrar el pedido:', error);
          alert('Error al registrar el pedido. Por favor, intente nuevamente.');
        }
      } else {
        activeStep.value++;
      }
    };

    const cerrarModal = () => {
      mostrarModalTipoPedido.value = false;
      tipoPedidoSeleccionado.value = null;
    };

    const procesarPedido = async () => {
      tipo.value = tipoPedidoSeleccionado.value;

      // Ajustar el monto total si es express

      /*
      if (tipoPedidoSeleccionado.value === 'express') {
        montoTotalPedido.value = montoTotalOriginal.value + 4;
      } else {
        montoTotalPedido.value = montoTotalOriginal.value;
      }*/

      montoTotalPedido.value = tipoPedidoSeleccionado.value === 'express'
        ? montoTotalOriginal.value + 4
        : montoTotalOriginal.value;

      observacionFinal.value += tipoPedidoSeleccionado.value === 'express'
        ? `\nCosto de envío Express: S/ 4.00`
        : '';


      
        mostrarModalTipoPedido.value = false;
        console.log("ENTRANDO A CIRCULAR PROGRESSSS------>>>>>>>>>>>>");
        openDialog();
        // mostrarCircularProgress();
        await crearPedido();
        
    };




    const registrarPedido = async () => {
      try {
        // Validaciones básicas
        if (!formData.nombre || !formData.telefono || !formData.direccion) {
          alert('Por favor complete los datos del cliente');
          return false;
        }

        // Verificar si hay productos seleccionados
        const hayProductosSeleccionados = [...productos.value, ...promos.value].some(item => item.cantidad > 0);
        if (!hayProductosSeleccionados) {
          alert('Por favor seleccione al menos un producto');
          return false;
        }

        // Realizar el registro del pedido
        const success = await crearPedido();
        return success;
      } catch (error) {
        console.error('Error en registrarPedido:', error);
        throw error;
      }
    };

    // Método para abrir el diálogo y cargar los datos del cliente
    const editClient = (client) => {
      editedItem.value = { ...client }; // Rellenar los campos con los datos actuales del cliente
      dialogMessage.value = `Se debe realizar una transferencia a ${client.banco_retiro} al siguiente número de cuenta o número de Yape/Plin: ${client.numero_cuenta}, la cantidad de: ${client.saldo_beneficios}, a la persona: ${client.nombre} ${client.apellidos}.`;
      dialogSaldo.value = true; // Mostrar el diálogo de edición
    };

    const updateClient = async () => {
      try {
        const response = await axios.put(`${apiUrl.value}${api}/user_cliente_saldo/${editedItem.value.id}`, {
          saldo_beneficios: 0,
          quiereretirar: false
        });

        if (response.status === 200) {
          // Encuentra el índice del cliente en la lista
          const index = clientes.value.findIndex(client => client.id === editedItem.value.id);

          if (index !== -1) {
            // Actualiza el saldo del cliente a 0 y la propiedad `quiereretirar` en la lista
            clientes.value[index].saldo_beneficios = 0;
            clientes.value[index].quiereretirar = false;

            // Filtra la lista para remover clientes con saldo 0 (si es parte de la lógica de visualización)
            clientes.value = clientes.value.filter(client => client.saldo_beneficios > 0);
          }

          // Cerrar el diálogo
          dialogSaldo.value = false;

          // Mostrar un mensaje de éxito
          alert('Cliente actualizado con éxito');
        }
      } catch (error) {
        console.error('Error al actualizar el cliente:', error);
        alert('Hubo un error al actualizar el cliente');
      }
    };



    /*
        const resetForm = () => {
          console.log('Reseteando formulario');
          Object.keys(formData).forEach(key => formData[key] = '');
          products.value.forEach(p => p.quantity = 0);
          editedIndex.value = -1;
          editedItem.value = {};
          console.log('Formulario reseteado');
        };
    */

    return {
      productos,
      //crearClienteNRPedidoYDetalle,
      listFinalProductosSeleccionadosConDSCT,
      promos,
      pedidos,
      getGoogleMapsLink,
      getWhatsAppLink,
      getEstadoColor,
      estadoPedido,
      autorizadoPor,
      cargo,
      dialog,
      dialogSaldo,
      incrementQuantity,
      decrementQuantity,
      confirmarItem,
      model,
      model1,
      activeStep,
      headers,
      items,
      search,
      searchQuery,
      formData,
      tipo,
      confirmData,
      dialogConfirm,
      listSeleccionados,
      listPromosSeleccionadas,
      listFinalProductosSeleccionados,
      crearPedido,
      descuentoTotalPedido,
      montoTotalPedido,
      observacionFinal,
      calculoDeSeleccionadosYMontos,
      resetearFormulario,
      prevs,
      nexts,
      registrarPedido,
      searchLocation,
      getAddress,
      getImageUrl,
      updateLocationRelation,
      mostrarModalTipoPedido,
      tipoPedidoSeleccionado,
      tiposPedido,
      cerrarModal,
      procesarPedido,
      clienteHeaders,
      clientes,
      searchClient,
      updateClient,
      editedItem,
      dialogMessage,
      editClient,
      dialogoVisible,
      pedidoEditado,
      estadosDisponibles,
      openEditDialog,
      cerrarDialogo,
      guardarCambios,
      deleteItem,
      cerrarDialogoEliminar,
      deletePedido,
      confirmarEliminacion,
      orderDialog,
      selectedOrder,
      productosYCantidadesPorPedido,
      viewOrder,
      deleteDialog,
      pedidoAEliminar,
      motivoEliminacion,
      getProductoDePromo,
      searchPedido,
      pedidoHeaders,
      pedidosproc,
      dialogCircular,
      openDialog,
      closeDialog,
    };
  }
};
</script>
<style scoped>
.highlight-row {
  background-color: #f0e8a0;
  /* Cambia este color según tus preferencias */
}

.actions-column {
  width: 150px;
  /* Increase width to give more space */
  text-align: center;
  /* Center the text in the header */
}

.v-data-table th.actions-column {
  width: 150px;
  /* Increase as needed */
  text-align: center;
  font-weight: bold;
}

.alineartexto {
  text-align: left;
  font-style: inherit;
  font-weight: bold;
  font-size: xx-large;

}
</style>
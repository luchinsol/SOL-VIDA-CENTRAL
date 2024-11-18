<template>

    <v-container class="fondito d-flex justify-center align-center" fluid
        style="height: 100vh; background-color:burlywood">

        <v-card style="height: 85%; width: 35%;" class="pa-0 ma-0 card-content">
            <p class="mb-5" style="font-size:15px; color: black;">
                Bienvenido a Cotecsa
            </p>
            <v-card-subtitle>
                Por favor ingresa tus credenciales
            </v-card-subtitle>



            <div style="margin-top: 20px;">
                <v-text-field v-model="usuario" style="color:blue;" dense width="200px" label="Usuario"
                    variant="underlined"></v-text-field>
                <v-text-field :type="mostrar ? 'text' : 'password'" v-model="contrasena" style="color:blue;" dense
                    width="200px" label="Contraseña" :append-inner-icon="mostrar ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarcontrasena" variant="underlined">
                </v-text-field>
            </div>
            <div style="margin-top:20px;">
                <v-btn style="background-color: blue; color:white; border-radius:20px" min-width="200px"
                    max-width="200px" @click="login">Ingresar</v-btn>
            </div>


        </v-card>

        <v-card style="height: 85%; width: 35%; background-color:blue" class="pa-0 ma-0">
            <div class="divimagen">
                <v-img :src="sol" contain></v-img>
            </div>
            <div class="divimagen">

                <v-img :src="logo" contain></v-img>
            </div>

        </v-card>
        <!-- Diálogo de carga -->
        <v-dialog v-model="loading" max-width="300">
            <v-card>
                <v-card-title>
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-card-title>
                <v-card-text>
                    Espere un momento...
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Diálogo de error -->
        <v-dialog v-model="alertvisible" max-width="500">
            <v-card :style="coloralert">
                <v-card-title :style="titleStyle" class="headline">{{ dialogtitulo }}</v-card-title>
                <v-card-text :style="textoStyle" align-center>
                    {{ alertmessage }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text :style="buttonColor" @click="alertvisible = false">OK</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>

</template>



<script>
import logo from '@/assets/bodegoncito.png';
import sol from '@/assets/nuevito.png'
import axios from "axios";
import { mapMutations } from 'vuex';
export default {
    name: 'LoginForm',
    data() {
        return {
            apiUrl: process.env.VUE_APP_API_URL,
            usuario: '',
            contrasena: '',
            mostrar: false,
            logo,
            sol,
            config_request: {
                headers: {
                    "Content-type": "application/json"
                }

            },
            alertvisible: false,
            loading: false,
            alertmessage: '',
            coloralert: {},
            titleStyle: {},
            textoStyle: {},
            buttonColor: {},
            dialogtitulo: ''

        }
    },
    methods: {
        ...mapMutations(['setUsuario', 'setRol']),
        async login() {
            console.log('Intentando iniciar sesión...');
            this.loading = true
            try {
                const response = await axios.post(`${this.apiUrl}/api/login`,
                    {
                        "nickname": this.usuario,
                        "contrasena": this.contrasena
                    },
                    this.config_request
                )
                console.log(`aqui : ${response}`)
                if (response.status == 200) {
                    this.loading=true
                    console.log(this.loading)
                    var result = response.data
                    console.log(result)
                    console.log(result.nombres)
                    const { usuario } = result
                    console.log({usuario})
                    console.log("NOMBRESSSSSSSSSSSS")
                    console.log(usuario.nombres); 


                    this.setUsuario(response.data.usuario)
                    console.log("Usuario almacenado en Vuex:", this.$store.state.usuario);
                    this.setRol(usuario.rol_id)
                    console.log(this.setRol(usuario.rol_id))
                    if (usuario.rol_id == 2) {
                        this.$router.push('/home')
                        console.log(this.$router.push('/home'))
                    }
                    else if (usuario.rol_id == 1) {
                        //this.$router.push('/administrador')
                    }
                    else {
                        this.$router.push('/')
                    }
                }

            } catch (error) {
                if (error.response && error.response.status === 401) {
                    this.loading = false
                    console.log("....dentro del 401")
                    this.alertmessage = 'Credenciales inválidas. Por favor intente de nuevo.';
                    this.alertvisible = true;
                    this.coloralert = { backgroundColor: '#ff5733' }
                    this.titleStyle = { color: '#ffffff' }
                    this.textoStyle = { color: '#ffffff ' }
                    this.dialogtitulo = 'Usuario inválido'
                    this.buttonColor = { color: '#ffffff' }
                } else if (error.response && error.response.status === 404) {
                    console.log("....dentro del 404")
                    this.alertmessage = 'Credenciales inválidas. Por favor intente de nuevo.';
                    this.alertvisible = true;
                } else {
                    console.error(`Error query login ${error}`)
                    this.alertmessage = 'Ocurrió un error. Por favor intente de nuevo más tarde.';
                    this.alertvisible = true;
                }
            }

            this.loading=false;
        },

        mostrarcontrasena() {
            this.mostrar = !this.mostrar;
        }




    },


}
</script>

<style scoped>
.divimagen {

    display: flex;
    justify-content: center;
    align-self: center;
    height: 40%;
    width: 100%;
    margin-top: 50px;
}
 
.fondito {
    background-image: url('https://i.pinimg.com/564x/4c/19/f7/4c19f7920a2fde1c2cb5a0d19b46e3c3.jpg');
    background-size: cover;
    /* Asegura que la imagen cubra todo el contenedor */
    background-position: center;
    /* Centra la imagen dentro del contenedor */
    background-repeat: no-repeat;
    /* Evita que la imagen se repita */
    background-attachment: fixed;
    /* Opcional: Fija la imagen en la vista del navegador */
    height: 100vh;
    /* Asegura que el contenedor tenga al menos la altura de la ventana del navegador */
}

.card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Centra verticalmente */
    align-items: center;
    /* Centra horizontalmente */
    text-align: center;
    /* Centra el texto dentro de los elementos */
}
</style>
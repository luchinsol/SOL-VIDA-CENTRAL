/*
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      Object.assign(args[0]['process.env'], {
        VUE_APP_API_URL: JSON.stringify(process.env.VUE_APP_API_URL)
      })
      return args
    })
  }
})*/

const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    // Añadir versión de hash a los archivos JS y CSS
    config.output.filename('js/[name].[contenthash].js');
    config.plugin('extract-css').tap(args => [{
      ...args[0],
      filename: 'css/[name].[contenthash].css'
    }]);

    // Configuración para manejar variables de entorno
    config.plugin('define').tap(args => {
      Object.assign(args[0]['process.env'], {
        VUE_APP_API_URL: JSON.stringify(process.env.VUE_APP_API_URL)
      });
      return args;
    });
  },
  // Opcional: Establecer los nombres de los archivos en el directorio de salida
  //publicPath: './', // Para que los archivos sean relativos
});

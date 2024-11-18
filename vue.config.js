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
})

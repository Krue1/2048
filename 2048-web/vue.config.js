const isPro = Object.is(process.env.NODE_ENV, 'development');
console.log(isPro);
module.exports = {
  // 公共路径(必须有的)
  publicPath: './',
  // 输出文件目录
  outputDir: 'dist',
  // 静态资源存放的文件夹(相对于ouputDir)
  assetsDir: 'static',
  // devServer: {
  //   port: 8080,
  //   host: '127.0.0.1',
  //   proxy: {
  //     '/api': {
  //       // 此处的写法，目的是为了 将 /api 替换成 https://www.baidu.com/
  //       // target: 'http://v.juhe.cn/',
  //       // target: 'http://47.100.62.222:8003',
  //       target: 'http://47.107.55.195:7002',
  //       // 允许跨域
  //       changeOrigin: true,
  //       pathRewrite: {
  //         '^/api': '/',
  //       },
  //     },
  //   },
  // },
};

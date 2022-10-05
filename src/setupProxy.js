const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/habistack',
    createProxyMiddleware({
      target: 'https://fathym-cloud-prd.azure-api.net/habistack/weather/ground/',
      changeOrigin: true,
      headers: {
        'lcu-subscription-key': process.env.REACT_APP_HABISTACK_LCU_SUBSCRIPTION_ID,
      },
      pathRewrite: {
        '^/habistack/': '/'
      },
      logLevel: 'debug',
      onError: (err) => {
        console.log(err);
      },
      onProxyRes: (proxyRes, req, res) => {
        // log original request and proxied request info
        const exchange = `[${req.method}] [${proxyRes.statusCode}] ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path}`;
        console.log(exchange); // [GET] [200] / -> http://www.example.com
      },
    })
  );
  
  app.use(
    '/geocodio',
    createProxyMiddleware({
      target: `https://api.geocod.io/v1.7/`,
      changeOrigin: true,
      headers: {
        'api-key': process.env.REACT_APP_GEOCODIO_API_KEY,
      },
      pathRewrite: {
        '^/geocodio/': '/',
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Adding Geocodio API key to path');
        
        proxyReq.path = `${proxyReq.path}&api_key=${process.env.REACT_APP_GEOCODIO_API_KEY}`;
      },
      onProxyRes: (proxyRes, req, res) => {
        // log original request and proxied request info
        const exchange = `[${req.method}] [${proxyRes.statusCode}] ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path}`;
        console.log(exchange); // [GET] [200] / -> http://www.example.com
      },
    })
  );
};

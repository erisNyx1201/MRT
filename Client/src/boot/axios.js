import { boot } from "quasar/wrappers";
import axios from "axios";

const api = axios.create({ baseURL: `http://${window.location.hostname}:9005/api` });

const baseURL =
  window.location.href.includes('devtunnels') && window.location.href.includes('9009')
    ? 'https://2n594s43-9005.usw3.devtunnels.ms/api' //forwarded public-port
    : 'http://localhost:9005/api'

const publicAPI = axios.create({ baseURL });

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$apiPub = publicAPI;
});

export { api, publicAPI };

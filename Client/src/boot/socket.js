// src/boot/socket.js
import { boot } from 'quasar/wrappers'
import { io } from 'socket.io-client'

const isDevTunnel = window.location.href.includes('devtunnels') && window.location.href.includes('9008')
const SOCKET_URL = isDevTunnel
    ? 'https://wzh1z8xd-9005.asse.devtunnels.ms' //forwarded public-port
    : `http://${window.location.hostname}:9005`

const socket = io(SOCKET_URL, {
  autoConnect: true, // can be set to false if you want to manually control connection
  transports: ['websocket']
})

export default boot(({ app }) => {
  app.config.globalProperties.$socket = socket
})

export { socket }

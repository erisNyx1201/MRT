// src/stores/ocr.js
import { defineStore } from 'pinia'
import { socket } from 'boot/socket'
// import { io } from "socket.io-client";

// let socket;

export const useSeshStore = defineStore('sesh', {
  state: () => ({
    room: '',
  }),

  actions: {
    initSocket() {
      if (socket) {
        socket.off('room:sync')

        socket.on('room:sync', (val) => {
          this.room = val
        })
      } else {
        console.warn('[SeshStore] Socket not available in initSocket')
      }
    },

    updateRoom(val) {
      this.room = val
      socket.emit('room:update', val)
    },

    disconnect() {
      if (socket) {
        socket.disconnect()
      }
    },
  },
})

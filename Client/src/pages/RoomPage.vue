<template>
  <q-page class="live-rooms-page q-pa-md bg-dark text-white">
    <div class="page-title q-mb-md">Live Rooms</div>

    <div class="toolbar q-mb-md">
      <q-btn
        color="primary"
        icon="refresh"
        label="Refresh Rooms"
        @click="loadRooms"
        :loading="loading"
      />

      <q-input
        v-model="search"
        dense
        filled
        dark
        clearable
        placeholder="Search room ID or team..."
        class="search-input"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <q-table
      flat
      bordered
      dark
      :rows="filteredRooms"
      :columns="columns"
      row-key="room_id"
      class="rooms-table"
      :loading="loading"
      :pagination="{ rowsPerPage: 20 }"
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            rounded
            :color="statusColor(props.row)"
            :label="statusLabel(props.row)"
          />
        </q-td>
      </template>

      <template #body-cell-match="props">
        <q-td :props="props">
          <div class="match-name">
            {{ team1Name(props.row) }} vs {{ team2Name(props.row) }}
          </div>
          <div class="text-caption text-grey-5">
            Room ID: {{ props.row.room_id }}
          </div>
        </q-td>
      </template>

      <template #body-cell-meta="props">
        <q-td :props="props">
          <div>{{ mapLabel(props.row) }}</div>
          <div class="text-caption text-grey-5">{{ phaseLabel(props.row) }}</div>
        </q-td>
      </template>

      <template #body-cell-action="props">
        <q-td :props="props" class="text-center">
          <q-btn
            color="primary"
            unelevated
            label="Open"
            @click="openRoom(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const search = ref('')
const rooms = ref([])

const columns = [
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'match', label: 'Match', field: 'match', align: 'left' },
  { name: 'meta', label: 'Map / Phase', field: 'meta', align: 'left' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

const filteredRooms = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return rooms.value

  return rooms.value.filter((room) => {
    const haystack = [
      String(room.room_id || ''),
      team1Name(room),
      team2Name(room),
      mapLabel(room),
      phaseLabel(room)
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(keyword)
  })
})

async function loadRooms() {
  try {
    loading.value = true
    const response = await api.get('/live/rooms')

    // Adjust this if your API envelope differs
    const rawRooms =
      response.data?.data?.room_list ||
      response.data?.room_list ||
      response.data?.data ||
      response.data ||
      []

    rooms.value = Array.isArray(rawRooms) ? rawRooms : []
  } catch (err) {
    console.error('Failed to load rooms', err)
    rooms.value = []
    $q.notify({ type: 'negative', message: 'Error loading live rooms' })
  } finally {
    loading.value = false
  }
}

function openRoom(room) {
  router.push(`/live/dashboard/${room.room_id}`)
}

function team1Name(room) {
  return (
    room.team1_name ||
    room.left_team_name ||
    room.club_team_name_1 ||
    room.team_a ||
    'Team 1'
  )
}

function team2Name(room) {
  return (
    room.team2_name ||
    room.right_team_name ||
    room.club_team_name_2 ||
    room.team_b ||
    'Team 2'
  )
}

function mapLabel(room) {
  return room.map_name || room.map || room.map_id || 'Unknown Map'
}

function phaseLabel(room) {
  return room.phase || room.state || room.status_text || 'Unknown Phase'
}

function statusLabel(room) {
  const raw =
    room.status ||
    room.state ||
    room.room_status ||
    room.phase ||
    ''

  const text = String(raw).toLowerCase()

  if (text.includes('ban') || text.includes('pick') || text.includes('draft')) return 'Draft'
  if (text.includes('battle') || text.includes('live') || text.includes('fight')) return 'Live'
  if (text.includes('wait') || text.includes('ready')) return 'Waiting'
  if (text.includes('end') || text.includes('finish')) return 'Ended'

  return raw || 'Unknown'
}

function statusColor(room) {
  const label = String(statusLabel(room)).toLowerCase()

  if (label === 'draft') return 'orange'
  if (label === 'live') return 'positive'
  if (label === 'waiting') return 'primary'
  if (label === 'ended') return 'grey'
  return 'grey-7'
}

onMounted(() => {
  loadRooms()
})
</script>

<style scoped>
.live-rooms-page {
  min-height: 100vh;
  background: #121212;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 320px;
}

.rooms-table {
  background: #1b1b1f;
}

.rooms-table :deep(thead tr th) {
  font-weight: 700;
  color: #cbd5f5;
  background: #1b1b1f;
}

.match-name {
  font-weight: 600;
}
</style>

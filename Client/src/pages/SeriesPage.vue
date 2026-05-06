<template>
  <q-page class="series-page q-pa-md">
    <div class="page-header row items-center justify-between q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold">Series</div>
        <div class="text-subtitle2 text-grey-5">
          Tournament rooms and played matches
        </div>
      </div>

      <q-btn
        color="primary"
        icon="refresh"
        label="Refresh"
        @click="loadSeries"
        :loading="loading"
      />
    </div>

    <q-table
      flat
      bordered
      dark
      row-key="room_id"
      :rows="seriesList"
      :columns="columns"
      :loading="loading"
      v-model:pagination="pagination"
      class="series-table"
      separator="cell"
    >
      <template #body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              flat
              dense
              round
              size="sm"
              color="primary"
              :icon="props.expand ? 'remove' : 'add'"
              @click="props.expand = !props.expand"
            />
          </q-td>

          <q-td key="room_id" :props="props">
            <div class="text-weight-medium">
              {{ props.row.room_id }}
            </div>
          </q-td>

          <q-td key="teams" :props="props">
            <div class="teams-wrapper">
              <div class="team blue-team">
                <div class="team-name">
                  {{ props.row.team1?.name || 'Team 1' }}
                </div>
                <div class="team-mini">
                  {{ props.row.team1?.mini_name || 'T1' }}
                </div>
              </div>

              <div class="series-score">
                {{ props.row.team1?.score || 0 }}
                -
                {{ props.row.team2?.score || 0 }}
              </div>

              <div class="team red-team">
                <div class="team-name">
                  {{ props.row.team2?.name || 'Team 2' }}
                </div>
                <div class="team-mini">
                  {{ props.row.team2?.mini_name || 'T2' }}
                </div>
              </div>
            </div>
          </q-td>

          <q-td key="bo" :props="props">
            BO{{ props.row.max_bo || '-' }}
          </q-td>

          <q-td key="matches" :props="props">
            {{ props.row.matches?.length || 0 }}
          </q-td>

          <q-td key="updated" :props="props">
            {{ formatDate(props.row.updatedAt) }}
          </q-td>
        </q-tr>

        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" class="expand-cell">
            <div class="expand-title q-mb-sm">
              Match History
            </div>

            <q-table
              flat
              bordered
              dark
              dense
              hide-pagination
              :rows="props.row.matchDetails || []"
              :columns="matchColumns"
              row-key="match_uid"
              class="match-table"
            >
              <template #body="matchProps">
                <q-tr :props="matchProps">
                  <q-td key="match_uid" :props="matchProps">
                    <div class="text-caption text-weight-medium">
                      {{ matchProps.row.match_uid }}
                    </div>
                  </q-td>

                  <q-td key="map" :props="matchProps">
                    {{ getMapName(matchProps.row.match_map_id) }}
                  </q-td>

                  <q-td key="mode" :props="matchProps">
                    {{ matchProps.row.game_mode_id || '-' }}
                  </q-td>

                  <q-td key="duration" :props="matchProps">
                    {{ formatDuration(matchProps.row.match_play_duration) }}
                  </q-td>

                  <q-td key="winner" :props="matchProps">
                    <div
                      class="winner-pill"
                      :class="{
                        blue: getWinner(matchProps.row) === 1,
                        red: getWinner(matchProps.row) === 2,
                      }"
                    >
                      {{ getWinnerName(matchProps.row, props.row) }}
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'

import { api } from 'boot/axios'

const $q = useQuasar()

const loading = ref(false)

const pagination = ref({
  rowsPerPage: 15,
  sortBy: 'updatedAt',
  descending: true,
})

const seriesList = ref([])

const columns = [
  {
    name: 'room_id',
    label: 'Room ID',
    field: 'room_id',
    align: 'left',
  },
  {
    name: 'teams',
    label: 'Teams',
    field: 'teams',
    align: 'center',
  },
  {
    name: 'bo',
    label: 'BO',
    field: 'max_bo',
    align: 'center',
  },
  {
    name: 'matches',
    label: 'Matches',
    field: (row) => row.matches?.length || 0,
    align: 'center',
  },
  {
    name: 'updated',
    label: 'Updated',
    field: 'updatedAt',
    align: 'center',
  },
]

const matchColumns = [
  {
    name: 'match_uid',
    label: 'Match UID',
    field: 'match_uid',
    align: 'left',
  },
  {
    name: 'map',
    label: 'Map',
    field: 'match_map_id',
    align: 'center',
  },
  {
    name: 'mode',
    label: 'Mode',
    field: 'game_mode_id',
    align: 'center',
  },
  {
    name: 'duration',
    label: 'Duration',
    field: 'match_play_duration',
    align: 'center',
  },
  {
    name: 'winner',
    label: 'Winner',
    field: 'winner',
    align: 'center',
  },
]

const mapNames = {
  1267: 'Yggsgard',
  1318: 'Tokyo 2099',
  1230: 'Klyntar',
}

const getMapName = (mapId) => {
  return mapNames[mapId] || `Map ${mapId}`
}

const formatDate = (date) => {
  if (!date) return '-'

  return dayjs(date).format('DD MMM YYYY HH:mm:ss')
}

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '-'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  return `${mins}:${String(secs).padStart(2, '0')}`
}

const getWinner = (match) => {
  const scoreInfo = match?.dynamic_fields?.score_info || {}

  const blue = Number(scoreInfo?.['1'] || 0)
  const red = Number(scoreInfo?.['2'] || 0)

  if (blue > red) return 1
  if (red > blue) return 2

  return 0
}

const getWinnerName = (match, series) => {
  const winner = getWinner(match)

  if (winner === 1) {
    return series?.team1?.name || 'Team 1'
  }

  if (winner === 2) {
    return series?.team2?.name || 'Team 2'
  }

  return 'Draw'
}

const loadSeries = async () => {
  loading.value = true

  try {
    const response = await api.get('/series')

    seriesList.value = response.data || []
  } catch (err) {
    console.error('Failed to load series', err)

    $q.notify({
      type: 'negative',
      message: 'Failed to load series',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSeries()
})
</script>

<style scoped>
.series-page {
  background: #111827;
  min-height: 100vh;
  color: white;
}

.series-table,
.match-table {
  background: #1f2937;
}

.expand-cell {
  background: #0f172a;
}

.expand-title {
  font-size: 16px;
  font-weight: 700;
}

.teams-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.team-name {
  font-weight: 700;
  font-size: 14px;
}

.team-mini {
  font-size: 11px;
  opacity: 0.7;
}

.blue-team {
  color: #60a5fa;
}

.red-team {
  color: #f87171;
}

.series-score {
  font-size: 18px;
  font-weight: 800;
}

.winner-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.winner-pill.blue {
  background: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
}

.winner-pill.red {
  background: rgba(239, 68, 68, 0.25);
  color: #f87171;
}
</style>

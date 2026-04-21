<template>
  <q-page class="live-dashboard-page q-pa-md bg-dark text-white">
    <div class="page-title q-mb-md">Marvel Rivals Live Dashboard</div>

    <div class="top-bar q-mb-md">
      <div class="score-box team1">{{ dashboard.meta.scoreLeft }}</div>

      <div class="match-center">
        <div class="map-name">{{ dashboard.meta.mapName }}</div>
        <div class="match-sub">
          Round {{ dashboard.meta.roundIndex }} · {{ formatSeconds(dashboard.meta.fightTime) }}
        </div>

        <div class="objective-block q-mt-sm">
          <div class="objective-top">
            <span class="objective-label">Objective</span>
            <span class="objective-status">{{ dashboard.objective.label }}</span>
            <span class="objective-percent">{{ dashboard.objective.percent.toFixed(1) }}%</span>
          </div>

          <div class="objective-track">
            <div
              class="objective-fill"
              :class="objectiveBarClass"
              :style="{ width: `${dashboard.objective.percent}%` }"
            />
          </div>

          <div class="objective-bottom">
            <span>Camp 1: {{ dashboard.objective.team1OnPoint }}</span>
            <span>Camp 2: {{ dashboard.objective.team2OnPoint }}</span>
          </div>
        </div>
      </div>

      <div class="score-box team2">{{ dashboard.meta.scoreRight }}</div>
    </div>

    <div class="summary-row q-mb-md">
      <div class="summary-card">
        <div class="summary-title">Team 1 Summary</div>
        <div>Total Kills ⚔️ : {{ dashboard.teams.team1.summary.kills }}</div>
        <div>Total Damage 💥 : {{ formatCompact(dashboard.teams.team1.summary.damage) }}</div>
        <div>Total Heal 💚 : {{ formatCompact(dashboard.teams.team1.summary.heal) }}</div>
        <div>Avg Hit % 🎯 : {{ formatPct(dashboard.teams.team1.summary.avgHitRate) }}</div>
      </div>

      <div class="summary-card">
        <div class="summary-title">Team 2 Summary</div>
        <div>Total Kills ⚔️ : {{ dashboard.teams.team2.summary.kills }}</div>
        <div>Total Damage 💥 : {{ formatCompact(dashboard.teams.team2.summary.damage) }}</div>
        <div>Total Heal 💚 : {{ formatCompact(dashboard.teams.team2.summary.heal) }}</div>
        <div>Avg Hit % 🎯 : {{ formatPct(dashboard.teams.team2.summary.avgHitRate) }}</div>
      </div>
    </div>

    <div class="tabs-row q-mb-md">
      <q-btn
        unelevated
        :color="activeTab === 'stats' ? 'primary' : 'grey-8'"
        label="Current Stats"
        @click="activeTab = 'stats'"
      />
      <q-btn
        unelevated
        :color="activeTab === 'draft' ? 'primary' : 'grey-8'"
        label="Ban / Pick"
        @click="activeTab = 'draft'"
      />
    </div>

    <div v-if="activeTab === 'stats'">
      <div class="team-grid">
        <div class="team-panel">
          <div class="team-panel-title">Team 1</div>

          <q-table
            flat
            dense
            hide-bottom
            :rows="dashboard.teams.team1.players"
            :columns="playerColumns"
            row-key="playerId"
            class="team-table team1-table"
            :pagination="{ rowsPerPage: 0 }"
          >
            <template #body="p">
              <q-tr :props="p" :class="playerRowClass(p.row, 'team1')">
                <q-td key="player" :props="p">
                  <div class="player-name-stack">
                    <span>{{ p.row.playerName }}</span>
                    <span v-if="p.row.isMVP" class="player-badge mvp">MVP</span>
                    <span v-else-if="p.row.isSVP" class="player-badge svp">SVP</span>
                  </div>
                </q-td>

                <q-td key="hero" :props="p">
                  <div class="hero-cell">
                    <div class="hero-thumb-wrap">
                      <img
                        :src="p.row.heroMeta.image"
                        :alt="p.row.heroMeta.displayName"
                        class="hero-thumb"
                        @error="e => (e.target.src = '/imgs/heroes/empty.png')"
                      />
                    </div>
                    <div class="hero-text">
                      <span class="hero-name">{{ p.row.heroMeta.displayName }}</span>
                      <span class="hero-id">ID {{ p.row.heroId }}</span>
                    </div>
                  </div>
                </q-td>

                <q-td key="k" :props="p">{{ p.row.kills }}</q-td>
                <q-td key="d" :props="p">{{ p.row.deaths }}</q-td>
                <q-td key="a" :props="p">{{ p.row.assists }}</q-td>
                <q-td key="dmg" :props="p">{{ formatCompact(p.row.damage) }}</q-td>
                <q-td key="heal" :props="p">{{ formatCompact(p.row.heal) }}</q-td>
                <q-td key="hit" :props="p">{{ formatPct(p.row.hitRate) }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </div>

        <div class="team-panel">
          <div class="team-panel-title">Team 2</div>

          <q-table
            flat
            dense
            hide-bottom
            :rows="dashboard.teams.team2.players"
            :columns="playerColumns"
            row-key="playerId"
            class="team-table team2-table"
            :pagination="{ rowsPerPage: 0 }"
          >
            <template #body="p">
              <q-tr :props="p" :class="playerRowClass(p.row, 'team2')">
                <q-td key="player" :props="p">
                  <div class="player-name-stack">
                    <span>{{ p.row.playerName }}</span>
                    <span v-if="p.row.isMVP" class="player-badge mvp">MVP</span>
                    <span v-else-if="p.row.isSVP" class="player-badge svp">SVP</span>
                  </div>
                </q-td>

                <q-td key="hero" :props="p">
                  <div class="hero-cell">
                    <div class="hero-thumb-wrap">
                      <img
                        :src="p.row.heroMeta.image"
                        :alt="p.row.heroMeta.displayName"
                        class="hero-thumb"
                        @error="e => (e.target.src = '/imgs/heroes/empty.png')"
                      />
                    </div>
                    <div class="hero-text">
                      <span class="hero-name">{{ p.row.heroMeta.displayName }}</span>
                      <span class="hero-id">ID {{ p.row.heroId }}</span>
                    </div>
                  </div>
                </q-td>

                <q-td key="k" :props="p">{{ p.row.kills }}</q-td>
                <q-td key="d" :props="p">{{ p.row.deaths }}</q-td>
                <q-td key="a" :props="p">{{ p.row.assists }}</q-td>
                <q-td key="dmg" :props="p">{{ formatCompact(p.row.damage) }}</q-td>
                <q-td key="heal" :props="p">{{ formatCompact(p.row.heal) }}</q-td>
                <q-td key="hit" :props="p">{{ formatPct(p.row.hitRate) }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>

      <div class="selected-panel q-mt-md" v-if="selectedPlayer">
        <div class="selected-header">
          <div class="selected-title">Selected Player</div>
          <div class="selected-name">{{ selectedPlayer.playerName }}</div>
        </div>

        <div class="selected-grid">
          <div><strong>Hero</strong><span>{{ selectedPlayer.heroMeta.displayName }}</span></div>
          <div><strong>KDA</strong><span>{{ selectedPlayer.kills }}/{{ selectedPlayer.deaths }}/{{ selectedPlayer.assists }}</span></div>
          <div><strong>Damage</strong><span>{{ formatCompact(selectedPlayer.damage) }}</span></div>
          <div><strong>Heal</strong><span>{{ formatCompact(selectedPlayer.heal) }}</span></div>
          <div><strong>Hit %</strong><span>{{ formatPct(selectedPlayer.hitRate) }}</span></div>
          <div><strong>MVP Val</strong><span>{{ selectedPlayer.mvpVal.toFixed(2) }}</span></div>
        </div>

        <div class="abilities-list q-mt-md">
          <div
            v-for="ability in selectedPlayer.abilities"
            :key="ability.id"
            class="ability-item"
          >
            <strong>{{ ability.id }}<template v-if="ability.name"> - {{ ability.name }}</template></strong>
            <span>CD {{ Number(ability.cooldown || 0).toFixed(2) }}</span>
            <span>{{ Math.round(Number(ability.energy || 0)) }}/{{ Math.round(Number(ability.energy_max || 0)) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="draft-panel">
        <q-table
          flat
          dense
          hide-bottom
          :rows="dashboard.draft"
          :columns="draftColumns"
          row-key="roundIndex"
          class="team-table"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body-cell-type="p">
            <q-td :props="p">
              {{ p.row.isPick ? 'PICK' : 'BAN' }}
            </q-td>
          </template>

          <template #body-cell-camp="p">
            <q-td :props="p">
              Camp {{ p.row.camp }}
            </q-td>
          </template>

          <template #body-cell-hero="p">
            <q-td :props="p">
              <div class="hero-cell">
                <div class="hero-thumb-wrap small">
                  <img
                    :src="p.row.heroImage"
                    :alt="p.row.heroName"
                    class="hero-thumb"
                    @error="e => (e.target.src = '/imgs/heroes/empty.png')"
                  />
                </div>
                <div class="hero-text">
                  <span class="hero-name">{{ p.row.heroName }}</span>
                  <span class="hero-id">ID {{ p.row.heroId }}</span>
                </div>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { api } from 'boot/axios'
// import { watch } from 'vue'
// import { useRoute } from 'vue-router'

// const route = useRoute()
// const roomId = computed(() => route.params.roomId)
const roomId = ref('12001') // replace later if dynamic
const activeTab = ref('stats')
const dashboard = ref({
  meta: {
    mapName: '-',
    roundIndex: 0,
    fightTime: 0,
    scoreLeft: 0,
    scoreRight: 0,
  },
  objective: {
    owner: 0,
    percent: 0,
    team1OnPoint: 0,
    team2OnPoint: 0,
    contested: false,
    label: 'NEUTRAL',
  },
  teams: {
    team1: { summary: {}, players: [] },
    team2: { summary: {}, players: [] },
  },
  draft: [],
  mvps: {
    mvpPlayerId: null,
    svpPlayerId: null,
  },
  updatedAt: null,
})

const selectedPlayerId = ref(null)
let pollTimer = null

const playerColumns = [
  { name: 'player', label: 'Player', field: 'playerName', align: 'left' },
  { name: 'hero', label: 'Hero', field: 'heroId', align: 'left' },
  { name: 'k', label: 'K', field: 'kills', align: 'center' },
  { name: 'd', label: 'D', field: 'deaths', align: 'center' },
  { name: 'a', label: 'A', field: 'assists', align: 'center' },
  { name: 'dmg', label: 'DMG', field: 'damage', align: 'center' },
  { name: 'heal', label: 'Heal', field: 'heal', align: 'center' },
  { name: 'hit', label: 'Hit ◈', field: 'hitRate', align: 'center' },
]

const draftColumns = [
  { name: 'round', label: 'Round', field: 'roundIndex', align: 'center' },
  { name: 'type', label: 'Type', field: 'isPick', align: 'center' },
  { name: 'camp', label: 'Camp', field: 'camp', align: 'center' },
  { name: 'hero', label: 'Hero', field: 'heroName', align: 'left' },
]

const allPlayers = computed(() => [
  ...(dashboard.value.teams.team1.players || []),
  ...(dashboard.value.teams.team2.players || []),
])

const selectedPlayer = computed(() =>
  allPlayers.value.find(p => String(p.playerId) === String(selectedPlayerId.value)) || null
)

const objectiveBarClass = computed(() => {
  if (dashboard.value.objective.contested) return 'contested'
  if (dashboard.value.objective.owner === 1) return 'team1'
  if (dashboard.value.objective.owner === 2) return 'team2'
  return 'neutral'
})

async function loadDashboard() {
  try {
    const response = await api.get(`/live/dashboard/${roomId.value}`)
    dashboard.value = response.data

    if (!selectedPlayerId.value) {
      const firstPlayer =
        response.data?.teams?.team1?.players?.[0] ||
        response.data?.teams?.team2?.players?.[0]
      selectedPlayerId.value = firstPlayer?.playerId || null
    }
  } catch (err) {
    console.error('Failed to load live dashboard', err)
  }
}

function startPolling() {
  stopPolling()
  loadDashboard()
  pollTimer = setInterval(loadDashboard, 250)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function playerRowClass(player, team) {
  return {
    'team1-mvp': player.isMVP && team === 'team1',
    'team2-mvp': player.isMVP && team === 'team2',
    'team1-svp': player.isSVP && team === 'team1',
    'team2-svp': player.isSVP && team === 'team2',
  }
}

function formatCompact(value) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0))
}

function formatPct(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`
}

function formatSeconds(v) {
  const total = Math.max(0, Math.floor(Number(v || 0)))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

onMounted(() => {
  startPolling()
})

// watch(
//   () => route.params.roomId,
//   (newRoomId) => {
//     console.log('Room changed to:', newRoomId)
//     loadDashboard() // 🔥 reload data
//   }
// )

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped>
.live-dashboard-page {
  background: #121212;
  min-height: 100vh;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
}

.top-bar {
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  gap: 16px;
  align-items: stretch;
}

.score-box {
  display: grid;
  place-items: center;
  font-size: 42px;
  font-weight: 800;
  border-radius: 16px;
  background: #1b1b1f;
  border: 1px solid rgba(255,255,255,0.12);
}

.score-box.team1 {
  color: #dbeafe;
}

.score-box.team2 {
  color: #fee2e2;
}

.match-center {
  background: #1b1b1f;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 16px;
}

.map-name {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
}

.match-sub {
  text-align: center;
  color: #94a3b8;
}

.objective-block {
  display: grid;
  gap: 8px;
}

.objective-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.objective-percent {
  margin-left: auto;
  font-weight: 800;
}

.objective-track {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.18);
}

.objective-fill {
  height: 100%;
  transition: width 0.2s ease;
}

.objective-fill.team1 {
  background: linear-gradient(90deg, #2563eb, #60a5fa);
}

.objective-fill.team2 {
  background: linear-gradient(90deg, #dc2626, #f87171);
}

.objective-fill.neutral {
  background: linear-gradient(90deg, #64748b, #94a3b8);
}

.objective-fill.contested {
  background: linear-gradient(90deg, #f59e0b, #fde047);
}

.objective-bottom {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 12px;
}

.summary-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summary-card,
.team-panel,
.selected-panel,
.draft-panel {
  background: #1b1b1f;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 16px;
}

.summary-title,
.team-panel-title,
.selected-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.team-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.team-table {
  background: transparent;
  border-radius: 18px;
  overflow: hidden;
}

.team-table :deep(thead tr th) {
  font-size: 12px;
  font-weight: 700;
  color: #e5e7eb;
  border: none;
  padding: 10px 12px;
}

.team-table :deep(tbody tr td) {
  border: none;
  padding: 10px 12px;
  color: #e5e7eb;
}

.team1-table :deep(thead tr th) {
  background: #172554;
  color: #dbeafe;
}

.team2-table :deep(thead tr th) {
  background: #7f1d1d;
  color: #fee2e2;
}

.team1-table :deep(tbody tr:nth-child(odd)) {
  background: rgba(30, 58, 138, 0.26);
}

.team1-table :deep(tbody tr:nth-child(even)) {
  background: rgba(30, 41, 59, 0.7);
}

.team2-table :deep(tbody tr:nth-child(odd)) {
  background: rgba(127, 29, 29, 0.28);
}

.team2-table :deep(tbody tr:nth-child(even)) {
  background: rgba(30, 20, 20, 0.72);
}

.team1-table :deep(tbody tr.team1-mvp) {
  background: linear-gradient(90deg, rgba(59,130,246,.30), rgba(37,99,235,.18)) !important;
}

.team2-table :deep(tbody tr.team2-mvp) {
  background: linear-gradient(90deg, rgba(239,68,68,.30), rgba(185,28,28,.18)) !important;
}

.team1-table :deep(tbody tr.team1-svp) {
  background: linear-gradient(90deg, rgba(59,130,246,.18), rgba(37,99,235,.10)) !important;
}

.team2-table :deep(tbody tr.team2-svp) {
  background: linear-gradient(90deg, rgba(239,68,68,.18), rgba(185,28,28,.10)) !important;
}

.hero-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-thumb-wrap {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.12);
  flex-shrink: 0;
}

.hero-thumb-wrap.small {
  width: 36px;
  height: 36px;
}

.hero-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.12) translateY(-6%);
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-name {
  font-weight: 700;
}

.hero-id {
  font-size: 12px;
  color: #94a3b8;
}

.player-name-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-badge {
  width: fit-content;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.player-badge.mvp {
  background: rgba(255,255,255,0.16);
}

.player-badge.svp {
  background: rgba(255,255,255,0.10);
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.selected-grid > div,
.ability-item {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 10px;
  display: grid;
  gap: 4px;
}

.abilities-list {
  display: grid;
  gap: 10px;
}

.tabs-row {
  display: flex;
  gap: 10px;
}

@media (max-width: 1000px) {
  .top-bar,
  .summary-row,
  .team-grid {
    grid-template-columns: 1fr;
  }

  .selected-grid {
    grid-template-columns: 1fr;
  }
}
</style>

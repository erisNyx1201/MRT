<template>
  <div class="live-dashboard dark">
    <div class="top-header">
      <div class="score-box team1-box">{{ dashboard.meta.scoreLeft }}</div>

      <div class="main-board header-center">
        <h1>{{ dashboard.meta.mapName }}</h1>

        <div class="match-info-bar">
          <div><strong>Round:</strong> {{ dashboard.meta.roundIndex }}</div>
          <div><strong>Fight Time:</strong> {{ formatSeconds(dashboard.meta.fightTime) }}</div>
          <!-- <div><strong>State:</strong> {{ matchStateLabel }}</div> -->
          <div><strong>Updated:</strong> {{ updatedTime }}</div>
        </div>

        <div class="objective-block">
          <div class="objective-top">
            <span class="objective-label">Objective</span>
            <span class="objective-status">{{ dashboard.objective.label }}</span>
            <span class="objective-percent">{{ dashboard.objective.percent.toFixed(1) }}%</span>
          </div>

          <div class="objective-track">
            <div class="objective-fill" :class="objectiveBarClass"
              :style="{ width: `${dashboard.objective.percent}%` }" />
          </div>

          <div class="objective-bottom">
            <span>Camp 1: {{ dashboard.objective.team1OnPoint }}</span>
            <span>Camp 2: {{ dashboard.objective.team2OnPoint }}</span>
          </div>
        </div>
      </div>

      <div class="score-box team2-box">{{ dashboard.meta.scoreRight }}</div>
    </div>

    <div class="summary-row">
      <div class="summary-box">
        <div class="summary-title">Camp 1 Summary</div>
        <div class="summary-values">
          <div>Total Kills ⚔️ : {{ dashboard.teams.team1.summary.kills || 0 }}</div>
          <div>Total Damage 💥 : {{ formatCompact(dashboard.teams.team1.summary.damage) }}</div>
          <div>Total Heal 💚 : {{ formatCompact(dashboard.teams.team1.summary.heal) }}</div>
          <div>Avg Hit % 🎯 : {{ formatPct(dashboard.teams.team1.summary.avgHitRate) }}</div>
        </div>
      </div>

      <div class="summary-box">
        <div class="summary-title">Camp 2 Summary</div>
        <div class="summary-values">
          <div>Total Kills ⚔️ : {{ dashboard.teams.team2.summary.kills || 0 }}</div>
          <div>Total Damage 💥 : {{ formatCompact(dashboard.teams.team2.summary.damage) }}</div>
          <div>Total Heal 💚 : {{ formatCompact(dashboard.teams.team2.summary.heal) }}</div>
          <div>Avg Hit % 🎯 : {{ formatPct(dashboard.teams.team2.summary.avgHitRate) }}</div>
        </div>
      </div>
    </div>

    <section class="main-board">
      <div class="tabs-row">
        <button class="tab-btn" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">
          Current Stats
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'banpick' }" @click="activeTab = 'banpick'">
          Ban / Pick
        </button>
      </div>

      <div v-if="activeTab === 'stats'">
        <div class="table-title-row">
          <div class="table-title">Camp 1</div>
          <div class="table-title">Camp 2</div>
        </div>

        <div class="team-table-grid">
          <div class="table-wrap scroll-x">
            <table class="team-table team1-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Hero</th>
                  <th>K</th>
                  <th>D</th>
                  <th>A</th>
                  <th>DMG</th>
                  <th>Heal</th>
                  <th>Hit</th>
                  <th>Ult</th>
                  <th>HP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in dashboard.teams.team1.players" :key="player.playerId"
                  :class="rowClass(player, 'team1')" @click="selectPlayer(player)">
                  <td>
                    <div class="name-stack">
                      <span>{{ player.playerName }}</span>
                      <span v-if="player.isMVP" class="badge mvp">MVP</span>
                      <span v-else-if="player.isSVP" class="badge svp">SVP</span>
                    </div>
                  </td>

                  <td>
                    <div class="hero-cell">
                      <img :src="player.heroMeta?.image" :alt="player.heroMeta?.displayName"
                        @error="e => (e.target.src = '/imgs/heroes/empty.png')" class="hero-thumb" />

                      <div class="hero-text">
                        <span class="hero-name">{{ player.heroMeta?.displayName }}</span>
                        <span class="hero-id">ID {{ player.heroId }}</span>
                      </div>
                    </div>
                  </td>

                  <td>{{ player.kills }}</td>
                  <td>{{ player.death }}</td>
                  <td>{{ player.assist }}</td>
                  <td>{{ formatCompact(player.damage) }}</td>
                  <td>{{ formatCompact(player.heal) }}</td>
                  <td>{{ formatPct(player.hitRate) }}</td>
                  <td>
                    <span class="ult-pill" :class="player.ultRatio >= 0.9 ? 'ready' : 'not-ready'">
                      {{ player.ultRatio >= 0.9 ? 'READY' : `${Math.round(player.ultRatio * 100)}%` }}
                    </span>
                  </td>
                  <td>{{ Math.round(player.hp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-wrap scroll-x">
            <table class="team-table team2-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Hero</th>
                  <th>K</th>
                  <th>D</th>
                  <th>A</th>
                  <th>DMG</th>
                  <th>Heal</th>
                  <th>Hit</th>
                  <th>Ult</th>
                  <th>HP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in dashboard.teams.team2.players" :key="player.playerId"
                  :class="rowClass(player, 'team2')" @click="selectPlayer(player)">
                  <td>
                    <div class="name-stack">
                      <span>{{ player.playerName }}</span>
                      <span v-if="player.isMVP" class="badge mvp">MVP</span>
                      <span v-else-if="player.isSVP" class="badge svp">SVP</span>
                    </div>
                  </td>

                  <td>
                    <div class="hero-cell">
                      <img :src="player.heroMeta?.localImage" :alt="player.heroMeta?.displayName"
                        @error="e => (e.target.src = '/imgs/heroes/empty.png')" class="hero-thumb" />

                      <div class="hero-text">
                        <span class="hero-name">{{ player.heroMeta?.displayName }}</span>
                        <span class="hero-id">ID {{ player.heroId }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ player.kills }}</td>
                  <td>{{ player.death }}</td>
                  <td>{{ player.assist }}</td>
                  <td>{{ formatCompact(player.damage) }}</td>
                  <td>{{ formatCompact(player.heal) }}</td>
                  <td>{{ formatPct(player.hitRate) }}</td>
                  <td>
                    <span class="ult-pill" :class="player.ultRatio >= 0.9 ? 'ready' : 'not-ready'">
                      {{ player.ultRatio >= 0.9 ? 'READY' : `${Math.round(player.ultRatio * 100)}%` }}
                    </span>
                  </td>
                  <td>{{ Math.round(player.hp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="selected-player-panel">
          <div class="selected-player-header">
            <h2>Selected Player</h2>
            <span v-if="selectedPlayer">{{ selectedPlayer.playerName }}</span>
          </div>

          <div v-if="selectedPlayer" class="player-detail">
            <div class="grid">
              <div><strong>Name</strong><span>{{ selectedPlayer.playerName }}</span></div>
              <div><strong>Hero</strong><span>{{ selectedPlayer.heroMeta?.displayName }}</span></div>
              <div><strong>Hero ID</strong><span>{{ selectedPlayer.heroId }}</span></div>
              <!-- <div><strong>Role</strong><span>{{ roleLabel(selectedPlayer.responsibility) }}</span></div> -->
              <div><strong>KDA</strong><span>{{ selectedPlayer.kills }}/{{ selectedPlayer.deaths }}/{{
                selectedPlayer.assists }}</span></div>
              <div><strong>DMG</strong><span>{{ formatCompact(selectedPlayer.damage) }}</span></div>
              <div><strong>HEAL</strong><span>{{ formatCompact(selectedPlayer.heal) }}</span></div>
              <div><strong>Hit %</strong><span>{{ formatPct(selectedPlayer.hitRate) }}</span></div>
              <div><strong>Ult</strong><span>{{ Math.round((selectedPlayer.ultRatio || 0) * 100) }}%</span></div>
              <!-- <div><strong>Performance</strong><span>{{ Number(selectedPlayer.mvp_val ?? 0).toFixed(2) }}</span></div> -->
            </div>

            <div class="selected-hero-header">
              <div class="hero-cell hero-cell-large">
                <img :src="selectedPlayer.heroMeta?.image" :alt="selectedPlayer.heroMeta?.displayName"
                  @error="e => (e.target.src = '/imgs/heroes/empty.png')" class="hero-thumb hero-thumb-large" />

                <div class="hero-text">
                  <span class="hero-name">{{ selectedPlayer.heroMeta?.displayName }}</span>
                  <span class="hero-id">ID {{ selectedPlayer.heroId }}</span>
                </div>
              </div>
            </div>

            <h3>Abilities</h3>
            <div class="cooldown-list">
              <div v-for="ability in selectedPlayer.abilities" :key="ability.id" class="cooldown-item">
                <strong>
                  {{ ability.id }}
                  <template v-if="ability.name"> - {{ ability.name }}</template>
                </strong>
                <span>CD {{ Number(ability.cooldown ?? 0).toFixed(2) }}</span>
                <span>
                  Energy:
                  {{ Math.round(Number(ability.energy || 0)) }}/{{ Math.round(Number(ability.energy_max || 0)) }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">Select a player from either team table</div>
        </div>
      </div>

      <div v-if="activeTab === 'banpick'" class="banpick-wrap">
        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <q-btn @click="startDraftLoop" color="secondary">Start Loop</q-btn>
          <q-btn @click="stopDraftLoop" color="red">Stop</q-btn>
        </div>

        <table class="banpick-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Action</th>
              <th>Camp</th>
              <th>Hero</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in displayedBanPick" :key="`${item.round_index}-${item.camp}-${index}`"
              :class="{ activeStep: index === currentStepIndex }">
              <td>{{ item.round_index }}</td>
              <td>{{ item.operate_type === 0 ? 'Ban' : 'Pick' }}</td>
              <td>{{ item.camp }}</td>
              <td>
                <div class="hero-cell">
                  <img :src="getHeroMeta(item.hero_id).localImage" :alt="getHeroMeta(item.hero_id).displayName"
                    @error="e => (e.target.src = '/imgs/heroes/empty.png')" class="hero-thumb" />

                  <div class="hero-text">
                    <span class="hero-name">{{ getHeroMeta(item.hero_id).displayName }}</span>
                    <span class="hero-id">ID {{ item.hero_id }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'

const route = useRoute()
const activeTab = ref('stats')
const roomId = computed(() => route.query?.roomId || 120001)
const loading = ref(false)
const isPolling = ref(false)
const selectedPlayerId = ref(null)
const pollTimer = ref(null)
const draftLoop = ref([])
const banPickInfo = computed(() => dashboard.value?.draft ?? [])

const displayedBanPick = computed(() => (draftLoop.value.length ? draftLoop.value : banPickInfo.value))


const emptyDashboard = () => ({
  meta: {
    mapId: null,
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
    team1: {
      camp: 1,
      players: [],
      summary: {
        kills: 0,
        deaths: 0,
        assists: 0,
        damage: 0,
        heal: 0,
        avgHitRate: 0,
      },
    },
    team2: {
      camp: 2,
      players: [],
      summary: {
        kills: 0,
        deaths: 0,
        assists: 0,
        damage: 0,
        heal: 0,
        avgHitRate: 0,
      },
    },
  },
  draft: [],
  mvps: {
    mvpPlayerId: null,
    svpPlayerId: null,
  },
  updatedAt: null,
})

const dashboard = ref(emptyDashboard())

// const playerColumns = [
//   { name: 'player', label: 'Player', field: 'playerName', align: 'left' },
//   { name: 'hero', label: 'Hero', field: 'heroId', align: 'left' },
//   { name: 'k', label: 'K', field: 'kills', align: 'center' },
//   { name: 'd', label: 'D', field: 'deaths', align: 'center' },
//   { name: 'a', label: 'A', field: 'assists', align: 'center' },
//   { name: 'dmg', label: 'DMG', field: 'damage', align: 'center' },
//   { name: 'heal', label: 'Heal', field: 'heal', align: 'center' },
//   { name: 'hit', label: 'Hit ◈', field: 'hitRate', align: 'center' },
//   { name: 'ult', label: 'Ult', field: 'ultRatio', align: 'center' },
// ]

const allPlayers = computed(() => [
  ...(dashboard.value.teams.team1.players || []),
  ...(dashboard.value.teams.team2.players || []),
])

const selectedPlayer = computed(() => {
  if (!selectedPlayerId.value) return null

  return allPlayers.value.find(
    player => String(player.playerId) === String(selectedPlayerId.value)
  ) || null
})

const objectiveBarClass = computed(() => {
  const objective = dashboard.value.objective

  if (objective.contested) return 'contested'
  if (objective.owner === 1) return 'team1'
  if (objective.owner === 2) return 'team2'
  return 'neutral'
})

const updatedTime = computed(() => {
  if (!dashboard.value.updatedAt) return '-'
  return new Date(dashboard.value.updatedAt).toLocaleTimeString()
})

async function loadBattle() {
  if (!roomId.value) return

  try {
    loading.value = true

    const response = await api.get(`/live/battle/${roomId.value}`)
    dashboard.value = {
      ...emptyDashboard(),
      ...response.data,
      teams: {
        team1: {
          ...emptyDashboard().teams.team1,
          ...(response.data?.teams?.team1 || {}),
        },
        team2: {
          ...emptyDashboard().teams.team2,
          ...(response.data?.teams?.team2 || {}),
        },
      },
      objective: {
        ...emptyDashboard().objective,
        ...(response.data?.objective || {}),
      },
      meta: {
        ...emptyDashboard().meta,
        ...(response.data?.meta || {}),
      },
    }

    if (!selectedPlayerId.value) {
      const firstPlayer = allPlayers.value[0]
      selectedPlayerId.value = firstPlayer?.playerId || null
    }
  } catch (err) {
    console.error('Failed to load live battle:', err)
  } finally {
    loading.value = false
  }
}

function startPolling() {
  stopPolling()
  isPolling.value = true
  loadBattle()
  pollTimer.value = setInterval(loadBattle, 500)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }

  isPolling.value = false
}

function selectPlayer(player) {
  selectedPlayerId.value = player?.playerId || null
}

function rowClass(player, team) {
  return {
    'team1-row': team === 'team1',
    'team2-row': team === 'team2',
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

function formatSeconds(value) {
  const total = Math.max(0, Math.floor(Number(value || 0)))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

watch(
  () => route.query.roomId,
  () => {
    selectedPlayerId.value = null
    dashboard.value = emptyDashboard()
    startPolling()
  }
)

onMounted(() => {
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped>
.live-dashboard.dark {
  background: #0b0f14;
  color: #e5e7eb;
  padding: 20px;
  min-height: 100vh;
}

.top-header {
  display: grid;
  grid-template-columns: 110px 1fr 110px;
  gap: 14px;
  align-items: stretch;
  margin-bottom: 14px;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.main-board {
  padding: 14px;
}

.summary-box,
.main-board,
.table-wrap,
.selected-player-panel,
.banpick-wrap {
  background: #131618;
  border: 1px solid #1e293b;
  border-radius: 16px;
}

.score-box {
  display: grid;
  place-items: center;
  font-size: 48px;
  font-weight: 800;
  min-height: 120px;
}

.team1-box {
  background: linear-gradient(180deg, #172554, #0f172a);
  color: #bfdbfe;
}

.team2-box {
  background: linear-gradient(180deg, #4c0519, #0f172a);
  color: #fecdd3;
}

.header-center h1 {
  margin: 0 0 12px;
  text-align: center;
  font-size: 42px;
  line-height: 1.1;
}

.match-info-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 18px;
  padding: 14px 40px;
}

.match-info-bar strong {
  margin-right: 6px;
  color: #94a3b8;
}

.summary-box {
  padding: 14px 16px;
}

.summary-title {
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
}

.summary-values {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 16px;
}

.tabs-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.tab-btn {
  background: #1f2937;
  color: #e5e7eb;
  border: 1px solid #334155;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.tab-btn.active {
  background: #334155;
  color: white;
}

.table-title-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 10px;
}

.table-title {
  text-align: center;
  padding: 10px;
  font-size: 18px;
  font-weight: 800;
  background: #111827;
  border-radius: 12px;
}

.team-table-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.table-wrap {
  overflow: hidden;
}

.scroll-x {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
}

.team-table,
.banpick-table {
  width: 100%;
  color: #e5e7eb;
  border-collapse: separate;
  border-spacing: 0;
}

.team-table thead th,
.banpick-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px 12px;
  font-size: 12px;
  letter-spacing: 0.03em;
  text-align: left;
}

.team-table tbody td,
.banpick-table tbody td {
  padding: 10px 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  vertical-align: middle;
}

.team-table {
  min-width: 900px;
}

.team1-table thead th {
  background: #172554;
  color: #bfdbfe;
}

.team2-table thead th {
  background: #4c0519;
  color: #fecdd3;
}

.team1-row {
  background: rgba(37, 99, 235, 0.1);
}

.team2-row {
  background: rgba(220, 38, 38, 0.1);
}

.team1-row:nth-child(even) {
  background: rgba(37, 99, 235, 0.14);
}

.team2-row:nth-child(even) {
  background: rgba(220, 38, 38, 0.14);
}

.team-table tbody tr:hover {
  filter: brightness(1.08);
  cursor: pointer;
}

.team1-mvp {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.18));
  box-shadow: inset 4px 0 0 #60a5fa, 0 0 14px rgba(96, 165, 250, 0.28);
}

.team2-mvp {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.3), rgba(185, 28, 28, 0.18));
  box-shadow: inset 4px 0 0 #f87171, 0 0 14px rgba(248, 113, 113, 0.24);
}

.team1-svp {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.18), rgba(37, 99, 235, 0.1));
  box-shadow: inset 3px 0 0 rgba(147, 197, 253, 0.85);
}

.team2-svp {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.18), rgba(185, 28, 28, 0.1));
  box-shadow: inset 3px 0 0 rgba(252, 165, 165, 0.85);
}

.name-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  width: fit-content;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.badge.mvp {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.badge.svp {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
}

.hero-cell-large {
  margin-bottom: 14px;
}

.hero-thumb {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #0f172a;
  border: 1px solid #334155;
}

.hero-thumb-large {
  width: 56px;
  height: 56px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hero-name {
  font-weight: 700;
  color: #e5e7eb;
  line-height: 1.2;
}

.hero-id {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.1;
}

.ult-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 82px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.ult-pill.ready {
  background: #22c55e;
  color: white;
}

.ult-pill.not-ready {
  background: #64748b;
  color: white;
}

.selected-player-panel {
  margin-top: 14px;
  padding: 16px;
}

.selected-player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.selected-player-header h2 {
  margin: 0;
}

.selected-player-header span {
  color: #94a3b8;
}

.player-detail .grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.player-detail .grid>div {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 10px;
  display: grid;
  gap: 4px;
}

.player-detail .grid strong {
  font-size: 12px;
  color: #94a3b8;
}

.player-detail .grid span {
  font-size: 14px;
  color: #e5e7eb;
}

.selected-hero-header {
  margin-bottom: 14px;
}

.cooldown-list {
  display: grid;
  gap: 10px;
}

.cooldown-item {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 10px;
  display: grid;
  gap: 4px;
}

.empty-state {
  color: #94a3b8;
}

.banpick-wrap {
  padding: 14px;
}

.activeStep {
  outline: 2px solid #a855f7;
  outline-offset: -2px;
}

.objective-block {
  min-width: 260px;
  display: grid;
  gap: 8px;
}

.objective-top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.objective-label {
  color: #94a3b8;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.objective-status {
  font-weight: 800;
  font-size: 13px;
}

.objective-percent {
  margin-left: auto;
  font-weight: 800;
  font-size: 13px;
}

.objective-track {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.18);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.objective-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease, background 0.3s ease;
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
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 1100px) {
  .player-detail .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {

  .top-header,
  .summary-row,
  .table-title-row,
  .team-table-grid {
    grid-template-columns: 1fr;
  }

  .header-center h1 {
    font-size: 32px;
  }
}

@media (max-width: 700px) {
  .live-dashboard.dark {
    padding: 12px;
  }

  .player-detail .grid {
    grid-template-columns: 1fr;
  }

  .hero-cell {
    min-width: 0;
  }
}
</style>

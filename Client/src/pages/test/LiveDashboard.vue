<template>
  <div class="live-dashboard dark">
    <header class="top-header">
      <div class="score-box left">{{ scoreLeft }}</div>

      <div class="header-center">
        <h1>Team 1 vs Team 2</h1>
        <div class="match-info-bar row">
          <div class="col">
            <div><strong>Map</strong> {{ mapLabel }}</div>
            <div><strong>Round</strong> {{ currentRound }}</div>
            <div><strong>Time</strong> {{ formatSeconds(levelInfo.fight_time) }}</div>
          </div>
          <div class="objective-block col">
            <div class="objective-top">
              <span class="objective-label">Objective</span>
              <span class="objective-status">{{ objectiveOwnerLabel }}</span>
              <span class="objective-percent">{{ objectivePercent.toFixed(1) }}%</span>
            </div>

            <div class="objective-track">
              <div class="objective-fill" :class="objectiveBarClass" :style="{ width: `${objectivePercent}%` }" />
            </div>

            <div class="objective-bottom">
              <span>Team 1 : {{ pointCharacters.team1 }} contested</span>
              <span>{{ pointCharacters.team2 }} contested : Team 2</span>
            </div>
          </div>
          <!-- <div><strong>Owner</strong> {{ ownerLabel }}</div>
          <div><strong>Point</strong> {{ objectivePercent.toFixed(1) }}%</div>
          <div><strong>On Point</strong> {{ pointCharactersText }}</div> -->
        </div>
      </div>

      <div class="score-box right">{{ scoreRight }}</div>
    </header>

    <section class="summary-row">
      <div class="summary-box">
        <div class="summary-title">Summary Team 1</div>
        <div class="summary-values">
          <span>K {{ team1Summary.kills }}</span>
          <span>D {{ team1Summary.deaths }}</span>
          <span>A {{ team1Summary.assists }}</span>
          <span>DMG {{ formatNumber(team1Summary.damage) }}</span>
          <span>Heal {{ formatNumber(team1Summary.heal) }}</span>
          <span>Hit {{ formatPercent(team1Summary.avgHitRate) }}</span>
        </div>
      </div>

      <div class="summary-box">
        <div class="summary-title">Summary Team 2</div>
        <div class="summary-values">
          <span>K {{ team2Summary.kills }}</span>
          <span>D {{ team2Summary.deaths }}</span>
          <span>A {{ team2Summary.assists }}</span>
          <span>DMG {{ formatNumber(team2Summary.damage) }}</span>
          <span>Heal {{ formatNumber(team2Summary.heal) }}</span>
          <span>Hit {{ formatPercent(team2Summary.avgHitRate) }}</span>
        </div>
      </div>
    </section>

    <section class="main-board">
      <div class="tabs-row">
        <button class="tab-btn" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">
          Current Stats
        </button>

        <button class="tab-btn" :class="{ active: activeTab === 'banpick' }" @click="activeTab = 'banpick'">
          Ban / Pick
        </button>
      </div>

      <div v-if="activeTab === 'stats'" class="stats-layout stacked">
        <div class="table-title-row">
          <div class="table-title">Team 1</div>
          <div class="table-title">Team 2</div>
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
                  <th>
                    Hit
                    <q-icon name="my_location" color="#bfdbfe" />
                  </th>
                  <th>Ult</th>
                  <th>HP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in team1Players" :key="player.playerId" :class="rowClass(player, 'team1')"
                  @click="selectPlayer(player)">
                  <td>
                    <div class="name-stack">
                      <span>{{ player.player_name }}</span>
                      <span v-if="player.isMVP" class="badge mvp">MVP</span>
                      <span v-else-if="player.isSVP" class="badge svp">SVP</span>
                    </div>
                  </td>

                  <td>
                    <div class="hero-cell">
                      <img v-if="player.heroMeta?.localImage" :src="player.heroMeta.localImage"
                        :alt="player.heroMeta.name" @error="e => e.target.src = '/imgs/heroes/empty.png'"
                        class="hero-thumb" />
                      <div v-else class="hero-thumb hero-thumb-fallback">
                        {{ player.select_hero }}
                      </div>

                      <div class="hero-text">
                        <span class="hero-name">{{ player.heroMeta?.displayName ?? `Hero ${player.select_hero}`
                        }}</span>
                        <span class="hero-id">ID {{ player.select_hero }}</span>
                      </div>
                    </div>
                  </td>

                  <td>{{ player.common.kill_score }}</td>
                  <td>{{ player.common.death_score }}</td>
                  <td>{{ player.common.assist_score }}</td>
                  <td>{{ compactNumber(player.common.total_hero_damage) }}</td>
                  <td>{{ compactNumber(player.common.total_heal) }}</td>
                  <td>{{ formatPercent(player.common.main_hit_rate) }}</td>

                  <td>
                    <span class="ult-pill" :class="player.ultRatio >= 0.9 ? 'ready' : 'not-ready'">
                      {{ player.ultRatio >= 0.9 ? 'READY' : 'NOT READY' }}
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
                  <th>
                    Hit
                    <q-icon name="my_location" color="#fecdd3" />
                  </th>
                  <th>Ult</th>
                  <th>HP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in team2Players" :key="player.playerId" :class="rowClass(player, 'team2')"
                  @click="selectPlayer(player)">
                  <td>
                    <div class="name-stack">
                      <span>{{ player.player_name }}</span>
                      <span v-if="player.isMVP" class="badge mvp">MVP</span>
                      <span v-else-if="player.isSVP" class="badge svp">SVP</span>
                    </div>
                  </td>

                  <td>
                    <div class="hero-cell">
                      <img v-if="player.heroMeta?.localImage" :src="player.heroMeta.localImage"
                        :alt="player.heroMeta.name" @error="e => e.target.src = '/imgs/heroes/empty.png'"
                        class="hero-thumb" />
                      <div v-else class="hero-thumb hero-thumb-fallback">
                        {{ player.select_hero }}
                      </div>

                      <div class="hero-text">
                        <span class="hero-name">{{ player.heroMeta?.displayName ?? `Hero ${player.select_hero}`
                        }}</span>
                        <span class="hero-id">ID {{ player.select_hero }}</span>
                      </div>
                    </div>
                  </td>

                  <td>{{ player.common.kill_score }}</td>
                  <td>{{ player.common.death_score }}</td>
                  <td>{{ player.common.assist_score }}</td>
                  <td>{{ compactNumber(player.common.total_hero_damage) }}</td>
                  <td>{{ compactNumber(player.common.total_heal) }}</td>
                  <td>{{ formatPercent(player.common.main_hit_rate) }}</td>

                  <td>
                    <span class="ult-pill" :class="player.ultRatio >= 0.9 ? 'ready' : 'not-ready'">
                      {{ player.ultRatio >= 0.9 ? 'READY' : 'NOT READY' }}
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
            <span v-if="selectedPlayer">{{ selectedPlayer.player_name }}</span>
          </div>

          <div v-if="selectedPlayer" class="player-detail">
            <div class="grid">
              <div><strong>Name</strong><span>{{ selectedPlayer.player_name }}</span></div>
              <div><strong>Hero</strong><span>{{ selectedPlayer.heroMeta?.displayName ?? `Hero
                  ${selectedPlayer.select_hero}` }}</span></div>
              <div><strong>Hero ID</strong><span>{{ selectedPlayer.select_hero }}</span></div>
              <div><strong>Role</strong><span>{{ roleLabel(selectedPlayer.responsibility) }}</span></div>
              <div><strong>KDA</strong><span>{{ selectedPlayer.common.kill_score }}/{{ selectedPlayer.common.death_score
              }}/{{ selectedPlayer.common.assist_score }}</span></div>
              <div><strong>DMG</strong><span>{{ formatNumber(selectedPlayer.common.total_hero_damage) }}</span></div>
              <div><strong>HEAL</strong><span>{{ formatNumber(selectedPlayer.common.total_heal) }}</span></div>
              <div><strong>ACC</strong><span>{{ formatPercent(selectedPlayer.common.main_hit_rate) }}</span></div>
              <div><strong>Ult</strong><span>{{ Math.round(selectedPlayer.ultRatio * 100) }}%</span></div>
              <div><strong>Performance</strong><span>{{ Number(selectedPlayer.mvp_val ?? 0).toFixed(2) }}</span></div>
            </div>

            <div class="selected-hero-header">
              <div class="hero-cell hero-cell-large">
                <img v-if="selectedPlayer.heroMeta?.localImage" :src="selectedPlayer.heroMeta.localImage"
                  :alt="selectedPlayer.heroMeta.name" @error="e => e.target.src = '/imgs/heroes/empty.png'"
                  class="hero-thumb hero-thumb-large" />
                <div v-else class="hero-thumb hero-thumb-large hero-thumb-fallback">
                  {{ selectedPlayer.select_hero }}
                </div>

                <div class="hero-text">
                  <span class="hero-name">{{ selectedPlayer.heroMeta?.displayName ?? `Hero
                    ${selectedPlayer.select_hero}` }}</span>
                  <span class="hero-id">ID {{ selectedPlayer.select_hero }}</span>
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
                <span>{{ formatEnergy(ability.energy, ability.energy_max) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">Select a player from either team table</div>
        </div>
      </div>

      <div v-if="activeTab === 'banpick'" class="banpick-wrap">
        <div style="display: flex; gap: 10px;">
          <q-btn @click="startDraftLoop" color="secondary">
            Start Loop
          </q-btn>
          <q-btn @click="stopDraftLoop" color="red">
            Stop
          </q-btn>
        </div>

        <table class="banpick-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Action</th>
              <th>Team</th>
              <th style="width: 50%;">Hero</th>
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
                  <img v-if="getHeroMeta(item.hero_id)?.localImage" :src="getHeroMeta(item.hero_id).localImage"
                    :alt="getHeroMeta(item.hero_id).name" @error="e => e.target.src = '/imgs/heroes/empty.png'"
                    class="hero-thumb" />
                  <div v-else class="hero-thumb hero-thumb-fallback">
                    {{ item.hero_id }}
                  </div>

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
import { computed, ref } from 'vue'
import rawData from '../../../../EEsample/sample_live.json'
import heroesRaw from '../../assets/heroes_UO.json'
import mapsRaw from '../../assets/maps.json'

const liveData = rawData?.data ?? rawData
const levelInfo = computed(() => liveData.level_info ?? {})
const mvps = computed(() => liveData.mvps ?? {})
const banPickInfo = computed(() => liveData.ban_pick_info ?? [])
const playersData = computed(() => liveData.players_data ?? {})

const draftLoop = ref([])
const currentStepIndex = ref(-1)
const isLooping = ref(false)

const activeTab = ref('stats')
const selectedPlayer = ref(null)

const roleMap = {
  1: 'Vanguard',
  2: 'Duelist',
  3: 'Strategist'
}

const heroesList = Array.isArray(heroesRaw) ? heroesRaw : []
const mapsList = Array.isArray(mapsRaw) ? mapsRaw : []

const heroMap = Object.fromEntries(
  heroesList.map(hero => [String(hero.id), hero])
)

const mapMap = Object.fromEntries(
  mapsList.map(map => [String(map.id), map])
)

function normalizeHeroName(name) {
  return String(name ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase())
}

function findHeroImage(heroId, heroName = '') {
  const safeName = String(heroName)
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]/g, '')

  // If no name, fallback to id-only image
  if (!safeName) {
    return `/imgs/heroes/${heroId}.png`
  }

  return `/imgs/heroes/${heroId}_${safeName}.png`
}

function getHeroMeta(heroId) {
  const hero = heroMap[String(heroId)]

  if (!hero) {
    return {
      id: heroId,
      name: `Hero ${heroId}`,
      displayName: `Hero ${heroId}`,
      localImage: `/imgs/heroes/${heroId}.png`,
      abilities: []
    }
  }

  return {
    ...hero,
    displayName: normalizeHeroName(hero.name),
    localImage: findHeroImage(hero.id, normalizeHeroName(hero.name))
  }
}

function getAbilityName(heroId, abilityId) {
  const hero = heroMap[String(heroId)]
  if (!hero?.abilities) return null

  const match = hero.abilities.find(a => Number(a.id) === Number(abilityId))
  return match?.name ?? null
}

const normalizedPlayers = computed(() => {
  return Object.entries(playersData.value).map(([playerId, player]) => {
    const common = player?.tab_data?.common_data ?? {}
    const selectedHero = player?.select_hero
    const heroMeta = getHeroMeta(selectedHero)

    const abilities = Object.entries(player?.abilities_cooldown ?? {}).map(([id, value]) => ({
      id,
      name: getAbilityName(selectedHero, id),
      ...value
    }))

    const maxEnergy = Number(player?.max_energy ?? 0)
    const currEnergy = Number(player?.curr_energy ?? 0)
    const hp = Number(player?.hp ?? 0)

    return {
      playerId,
      ...player,
      common,
      heroMeta,
      abilities,
      hpRatio: Math.max(0, Math.min(1, hp / 800)),
      ultRatio: maxEnergy > 0 ? Math.max(0, Math.min(1, currEnergy / maxEnergy)) : 0,
      isMVP: Number(mvps.value[1]) === Number(playerId),
      isSVP: Number(mvps.value[2]) === Number(playerId)
    }
  })
})

const team1Players = computed(() => normalizedPlayers.value.filter(p => p.camp === 1))
const team2Players = computed(() => normalizedPlayers.value.filter(p => p.camp === 2))

function selectPlayer(player) {
  selectedPlayer.value = player
}

function rowClass(player, team) {
  return {
    'team1-row': team === 'team1',
    'team2-row': team === 'team2',
    'team1-mvp': player.isMVP && team === 'team1',
    'team2-mvp': player.isMVP && team === 'team2',
    'team1-svp': player.isSVP && team === 'team1',
    'team2-svp': player.isSVP && team === 'team2'
  }
}

const scoreLeft = computed(() => levelInfo.value.round_score?.[0] ?? 0)
const scoreRight = computed(() => levelInfo.value.round_score?.[1] ?? 0)
const currentRound = computed(() => levelInfo.value.round_index ?? '-')
const objectivePercent = computed(() => {
  return Math.max(0, Math.min(100, Number(levelInfo.value?.current_degree ?? 0) * 100))
})

const objectiveOwner = computed(() => Number(levelInfo.value?.current_owner ?? 0))

const pointCharacters = computed(() => {
  const arr = levelInfo.value?.point_character_num ?? [0, 0]
  return {
    team1: Number(arr[0] ?? 0),
    team2: Number(arr[1] ?? 0)
  }
})

const isContested = computed(() => {
  return pointCharacters.value.team1 > 0 && pointCharacters.value.team2 > 0
})

const objectiveOwnerLabel = computed(() => {
  if (isContested.value) return 'CONTESTED'
  if (objectiveOwner.value === 1) return 'CAMP 1 CONTROL'
  if (objectiveOwner.value === 2) return 'CAMP 2 CONTROL'
  return 'NEUTRAL'
})

const objectiveBarClass = computed(() => {
  // if (isContested.value) return 'contested'
  if (objectiveOwner.value === 1) return 'team1'
  if (objectiveOwner.value === 2) return 'team2'
  return 'neutral'
})

// const ownerLabel = computed(() => `Camp ${levelInfo.value.current_owner ?? '-'}`)
// const pointCharactersText = computed(() => {
//   const a = levelInfo.value.point_character_num?.[0] ?? 0
//   const b = levelInfo.value.point_character_num?.[1] ?? 0
//   return `${a} vs ${b}`
// })

const mapLabel = computed(() => {
  const mapId = String(levelInfo.value.map_id ?? '')
  const map = mapMap[mapId]
  if (!map) return `Map ${mapId || '-'}`
  return map.name || map.sub_name || `Map ${mapId}`
})

//function heroDisplayById(heroId) {
//const hero = getHeroMeta(heroId)
//return `${hero.displayName} (${hero.id})`
//}

function buildTeamSummary(players) {
  const base = {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    heal: 0,
    hitRate: 0
  }

  const total = players.reduce((acc, p) => {
    acc.kills += Number(p.common.kill_score ?? 0)
    acc.deaths += Number(p.common.death_score ?? 0)
    acc.assists += Number(p.common.assist_score ?? 0)
    acc.damage += Number(p.common.total_hero_damage ?? 0)
    acc.heal += Number(p.common.total_heal ?? 0)
    acc.hitRate += Number(p.common.main_hit_rate ?? 0)
    return acc
  }, base)

  return {
    ...total,
    avgHitRate: players.length ? total.hitRate / players.length : 0
  }
}

const team1Summary = computed(() => buildTeamSummary(team1Players.value))
const team2Summary = computed(() => buildTeamSummary(team2Players.value))

function roleLabel(v) {
  return roleMap[v] ?? `Role ${v}`
}

function formatNumber(v) {
  return new Intl.NumberFormat().format(Math.round(Number(v ?? 0)))
}

function compactNumber(v) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(v ?? 0))
}

function formatPercent(v) {
  return `${(Number(v ?? 0) * 100).toFixed(1)}%`
}

function formatSeconds(v) {
  const total = Math.max(0, Math.floor(Number(v ?? 0)))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatEnergy(e, m) {
  return `${Math.round(Number(e ?? 0))}/${Math.round(Number(m ?? 0))}`
}

// loop through ban/pick info for demo purposes
async function startDraftLoop() {
  if (isLooping.value) return

  isLooping.value = true
  const source = [...banPickInfo.value]

  while (isLooping.value) {
    for (let i = 0; i < source.length; i++) {
      draftLoop.value = source.slice(0, i + 1)
      currentStepIndex.value = i
      await wait(800)

      if (!isLooping.value) break
    }

    // reset for loop
    draftLoop.value = []
    currentStepIndex.value = -1
  }
}

function stopDraftLoop() {
  isLooping.value = false
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const displayedBanPick = computed(() => {
  return draftLoop.value.length ? draftLoop.value : banPickInfo.value
})

</script>

<style scoped>
.live-dashboard.dark {
  background: dark;
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
  border: 1px solid #1e1e1f;
  border-radius: 16px;
}

.score-box {
  display: grid;
  place-items: center;
  font-size: 48px;
  font-weight: 800;
  min-height: 120px;
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
  /* background: #111827;
  border: 1px solid #334155;
  border-radius: 16px; */
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
  /* adjust based on how many columns you have */
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
  background: rgba(37, 99, 235, 0.10);
}

.team2-row {
  background: rgba(220, 38, 38, 0.10);
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
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.30), rgba(37, 99, 235, 0.18));
  box-shadow: inset 4px 0 0 #60a5fa, 0 0 14px rgba(96, 165, 250, 0.28);
}

.team2-mvp {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.30), rgba(185, 28, 28, 0.18));
  box-shadow: inset 4px 0 0 #f87171, 0 0 14px rgba(248, 113, 113, 0.24);
}

.team1-svp {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.18), rgba(37, 99, 235, 0.10));
  box-shadow: inset 3px 0 0 rgba(147, 197, 253, 0.85);
}

.team2-svp {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.18), rgba(185, 28, 28, 0.10));
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
  background: rgba(255, 255, 255, 0.10);
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

.hero-thumb-fallback {
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
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

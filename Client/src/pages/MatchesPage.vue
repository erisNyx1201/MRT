<template>
  <q-page class="matches-page q-pa-md bg-dark">
    <div class="page-title q-mb-md">List of Matches</div>

    <q-table
      flat
      bordered
      dark
      :rows="matchRows"
      :columns="columns"
      row-key="match_uid"
      hide-bottom
      class="matches-table"
      :pagination="{ rowsPerPage: 0 }"
      :loading="loading"
    >
      <template #body="props">
        <q-tr :props="props" class="match-row">
          <q-td auto-width>
            <q-btn
              round
              dense
              size="sm"
              :color="props.expand ? 'negative' : 'positive'"
              :icon="props.expand ? 'remove' : 'add'"
              @click="props.expand = !props.expand"
            />
          </q-td>

          <q-td key="name" :props="props">
            <div class="text-weight-medium">
              {{ props.row.title }}
            </div>
            <div class="text-caption text-grey-5">
              {{ props.row.mapLabel }}
            </div>
            <div class="text-caption text-grey-6">
              {{ props.row.match_uid }}
            </div>
          </q-td>

          <q-td key="score" :props="props" class="text-center">
            <!-- <q-badge rounded :color="props.row.stateColor" :label="props.row.stateLabel" /> -->
            <div class="q-mt-xs text-weight-bold score-line">
              {{ props.row.scoreLabel }}
            </div>
          </q-td>

          <q-td key="leftSummary" :props="props" class="team-summary-cell">
            <div>Total Kills ⚔️ : {{ props.row.leftSummary.kills }}</div>
            <div>Total Damage 💥 : {{ formatCompact(props.row.leftSummary.damage) }}</div>
            <div>Total Heal 💚 : {{ formatCompact(props.row.leftSummary.heal) }}</div>
            <div>Avg Hit % 🎯 : {{ formatPct(props.row.leftSummary.avgHitRate) }}</div>
          </q-td>

          <q-td key="leftHeroes" :props="props">
            <div class="hero-strip left-strip">
              <!-- <div class="outer-hero-thumb-wrap">
                <img
                  v-for="hero in props.row.leftPicks"
                  :key="hero"
                  :src="heroImage(hero.hero_id)"
                  :alt="heroLabel(hero.hero_id)"
                  class="outer-hero-thumb"
                  @error="e => (e.target.src = '/imgs/heroes/empty.png')"
                />
              </div> -->
              <div class="hero-group picks">
                <div
                  v-for="hero in props.row.leftPicks"
                  :key="`lp-${hero.hero_id}-${hero.round_idx}`"
                  class="hero-box pick"
                  :title="hero.heroName"
                >
                  {{ hero.shortName }}
                </div>
              </div>

              <div class="hero-group bans">
                <div
                  v-for="hero in props.row.leftBans"
                  :key="`lb-${hero.hero_id}-${hero.round_idx}`"
                  class="hero-box ban"
                  :title="hero.heroName"
                >
                  {{ hero.shortName }}
                </div>
              </div>
            </div>
          </q-td>

          <q-td key="rightHeroes" :props="props">
            <div class="hero-strip right-strip">
              <div class="hero-group bans">
                <div
                  v-for="hero in props.row.rightBans"
                  :key="`rb-${hero.hero_id}-${hero.round_idx}`"
                  class="hero-box ban"
                  :title="hero.heroName"
                >
                  {{ hero.shortName }}
                </div>
              </div>

              <div class="hero-group picks">
                <div
                  v-for="hero in props.row.rightPicks"
                  :key="`rp-${hero.hero_id}-${hero.round_idx}`"
                  class="hero-box pick"
                  :title="hero.heroName"
                >
                  {{ hero.shortName }}
                </div>
              </div>
            </div>
          </q-td>

          <q-td key="rightSummary" :props="props" class="team-summary-cell text-right">
            <div>{{ props.row.rightSummary.kills }} : Total Kills ⚔️</div>
            <div>{{ formatCompact(props.row.rightSummary.damage) }} : Total Damage 💥</div>
            <div>{{ formatCompact(props.row.rightSummary.heal) }} : Total Heal 💚</div>
            <div>{{ formatPct(props.row.rightSummary.avgHitRate) }} : Avg Hit % 🎯</div>
          </q-td>
        </q-tr>

        <q-tr v-show="props.expand" :props="props" class="expand-row">
          <q-td colspan="100%">
            <div class="expand-card">
              <div class="overview-strip q-mb-md">
                <div class="draft-side">
                  <div class="team-label">{{ props.row.leftTeamName }}</div>
                  <div class="draft-icons">
                    <div class="mini-group">
                      <div
                        v-for="hero in props.row.leftPicks"
                        :key="`lp-${hero.hero_id}-${hero.round_idx}`"
                        class="mini-hero pick"
                        :title="hero.heroName"
                      >
                        {{ hero.shortName }}
                      </div>
                    </div>
                    <div class="mini-group bans">
                      <div
                        v-for="hero in props.row.leftBans"
                        :key="`lb-${hero.hero_id}-${hero.round_idx}`"
                        class="mini-hero ban"
                        :title="hero.heroName"
                      >
                        {{ hero.shortName }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="score-center">
                  <div class="series-score">
                    {{ props.row.leftScore }} - {{ props.row.rightScore }}
                  </div>
                  <div class="text-caption text-grey-5">
                    {{ props.row.modeLabel }} · {{ formatDuration(props.row.match_play_duration) }}
                  </div>
                </div>

                <div class="draft-side right">
                  <div class="draft-icons">
                    <div class="mini-group bans">
                      <div
                        v-for="hero in props.row.rightBans"
                        :key="`rb-${hero.hero_id}-${hero.round_idx}`"
                        class="mini-hero ban"
                        :title="hero.heroName"
                      >
                        {{ hero.shortName }}
                      </div>
                    </div>
                    <div class="mini-group">
                      <div
                        v-for="hero in props.row.rightPicks"
                        :key="`rp-${hero.hero_id}-${hero.round_idx}`"
                        class="mini-hero pick"
                        :title="hero.heroName"
                      >
                        {{ hero.shortName }}
                      </div>
                    </div>
                  </div>
                  <div class="team-label text-right">{{ props.row.rightTeamName }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="team-panel">
                    <div class="team-panel-title">{{ props.row.leftTeamName }}</div>
                    <q-table
                      flat
                      dense
                      hide-bottom
                      :rows="props.row.leftPlayers"
                      :columns="playerColumns"
                      row-key="player_uid"
                      class="inner-table team-table team1-table"
                      :pagination="{ rowsPerPage: 0 }"
                    >
                      <template #body="p">
                        <q-tr :props="p" :class="playerRowClass(p.row, 'team1')">
                          <q-td key="player" :props="p">
                            <div class="player-name-stack">
                              <span>{{ p.row.nick_name }}</span>
                              <span v-if="p.row.isMVP" class="player-badge mvp">MVP</span>
                              <span v-else-if="p.row.isSVP" class="player-badge svp">SVP</span>
                            </div>
                          </q-td>

                          <q-td key="hero" :props="p">
                            <div class="inner-hero-cell">
                              <div class="inner-hero-thumb-wrap">
                                <img
                                  :src="heroImage(p.row.cur_hero_id)"
                                  :alt="heroLabel(p.row.cur_hero_id)"
                                  class="inner-hero-thumb"
                                  @error="e => (e.target.src = '/imgs/heroes/empty.png')"
                                />
                              </div>
                              <div class="inner-hero-text">
                                <span class="inner-hero-name">{{ heroNameOnly(p.row.cur_hero_id) }}</span>
                                <span class="inner-hero-id">ID {{ p.row.cur_hero_id }}</span>
                              </div>
                            </div>
                          </q-td>

                          <q-td key="k" :props="p">{{ p.row.k }}</q-td>
                          <q-td key="d" :props="p">{{ p.row.d }}</q-td>
                          <q-td key="a" :props="p">{{ p.row.a }}</q-td>
                          <q-td key="dmg" :props="p">{{ formatCompact(p.row.total_hero_damage) }}</q-td>
                          <q-td key="heal" :props="p">{{ formatCompact(p.row.total_hero_heal) }}</q-td>
                          <q-td key="hit" :props="p">{{ formatPct(p.row.session_hit_rate) }}</q-td>
                        </q-tr>
                      </template>
                    </q-table>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="team-panel">
                    <div class="team-panel-title">{{ props.row.rightTeamName }}</div>
                    <q-table
                      flat
                      dense
                      hide-bottom
                      :rows="props.row.rightPlayers"
                      :columns="playerColumns"
                      row-key="player_uid"
                      class="inner-table team-table team2-table"
                      :pagination="{ rowsPerPage: 0 }"
                    >
                      <template #body="p">
                        <q-tr :props="p" :class="playerRowClass(p.row, 'team2')">
                          <q-td key="player" :props="p">
                            <div class="player-name-stack">
                              <span>{{ p.row.nick_name }}</span>
                              <span v-if="p.row.isMVP" class="player-badge mvp">MVP</span>
                              <span v-else-if="p.row.isSVP" class="player-badge svp">SVP</span>
                            </div>
                          </q-td>

                          <q-td key="hero" :props="p">
                            <div class="inner-hero-cell">
                              <div class="inner-hero-thumb-wrap">
                                <img
                                  :src="heroImage(p.row.cur_hero_id)"
                                  :alt="heroLabel(p.row.cur_hero_id)"
                                  class="inner-hero-thumb"
                                  @error="e => (e.target.src = '/imgs/heroes/empty.png')"
                                />
                              </div>
                              <div class="inner-hero-text">
                                <span class="inner-hero-name">{{ heroNameOnly(p.row.cur_hero_id) }}</span>
                                <span class="inner-hero-id">ID {{ p.row.cur_hero_id }}</span>
                              </div>
                            </div>
                          </q-td>

                          <q-td key="k" :props="p">{{ p.row.k }}</q-td>
                          <q-td key="d" :props="p">{{ p.row.d }}</q-td>
                          <q-td key="a" :props="p">{{ p.row.a }}</q-td>
                          <q-td key="dmg" :props="p">{{ formatCompact(p.row.total_hero_damage) }}</q-td>
                          <q-td key="heal" :props="p">{{ formatCompact(p.row.total_hero_heal) }}</q-td>
                          <q-td key="hit" :props="p">{{ formatPct(p.row.session_hit_rate) }}</q-td>
                        </q-tr>
                      </template>
                    </q-table>
                  </div>
                </div>
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import heroesRaw from '../assets/heroes_UO.json'
import mapsRaw from '../assets/maps.json'

const $q = useQuasar();

const matches = ref([])
const loading = ref(false)

const heroes = Array.isArray(heroesRaw) ? heroesRaw : []
const maps = Array.isArray(mapsRaw) ? mapsRaw : []

const heroMap = Object.fromEntries(heroes.map(h => [Number(h.id), h]))
const mapMap = Object.fromEntries(maps.map(m => [Number(m.id), m]))

const columns = [
  { name: 'expand', label: '', field: 'expand', align: 'left' },
  { name: 'name', label: 'Name', field: 'title', align: 'left', style: 'width: 15%' },
  { name: 'score', label: 'Score', field: 'scoreLabel', align: 'center', style: 'width: 10%' },
  { name: 'leftSummary', label: 'Summary Team 1', field: 'leftSummary', align: 'left', style: 'width: 10%' },
  { name: 'leftHeroes', label: 'Heroes Team 1', field: 'leftHeroes', align: 'left', style: 'width: 25%' },
  { name: 'rightHeroes', label: 'Heroes Team 2', field: 'rightHeroes', align: 'right', style: 'width: 25%' },
  { name: 'rightSummary', label: 'Summary Team 2', field: 'rightSummary', align: 'right', style: 'width: 10%' }
]

const playerColumns = [
  { name: 'player', label: 'Player', field: 'nick_name', align: 'left' },
  { name: 'hero', label: 'Hero', field: 'cur_hero_id', align: 'left' },
  { name: 'k', label: 'K', field: 'k', align: 'center' },
  { name: 'd', label: 'D', field: 'd', align: 'center' },
  { name: 'a', label: 'A', field: 'a', align: 'center' },
  { name: 'dmg', label: 'DMG', field: 'total_hero_damage', align: 'center' },
  { name: 'heal', label: 'Heal', field: 'total_hero_heal', align: 'center' },
  { name: 'hit', label: 'Hit ◈', field: 'session_hit_rate', align: 'center' }
]

const loadMatches = async () => {
  try {
    const response = await api.get('/matches');
    matches.value = response.data;
  } catch (err) {
    console.error('Failed to load matches', err);
    $q.notify({ type: 'negative', message: 'Error loading matches' });
  }
};

function safeParseLeagueInfo(value) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : (value || {})
  } catch {
    return {}
  }
}

function toTitle(text = '') {
  return String(text)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, s => s.toUpperCase())
}

function heroLabel(heroId) {
  const hero = heroMap[Number(heroId)]
  if (!hero) return `Hero ${heroId}`
  return `${toTitle(hero.name)} (${hero.id})`
}

function shortHeroName(heroId) {
  const hero = heroMap[Number(heroId)]
  if (!hero?.name) return String(heroId)

  const words = toTitle(hero.name).split(' ')
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()

  return words.map(w => w[0]).join('').slice(0, 3).toUpperCase()
}

function mapLabel(mapId) {
  const map = mapMap[Number(mapId)]
  return map?.full_name || map?.name || `Map ${mapId}`
}

function formatCompact(value) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(value || 0))
}

function formatPct(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`
}

function formatDuration(seconds) {
  const total = Math.floor(Number(seconds || 0))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function summarizeTeam(players) {
  const total = players.reduce((acc, p) => {
    acc.kills += Number(p.k || 0)
    acc.damage += Number(p.total_hero_damage || 0)
    acc.heal += Number(p.total_hero_heal || 0)
    acc.hitRate += Number(p.session_hit_rate || 0)
    return acc
  }, { kills: 0, damage: 0, heal: 0, hitRate: 0 })

  return {
    kills: total.kills,
    damage: total.damage,
    heal: total.heal,
    avgHitRate: players.length ? total.hitRate / players.length : 0
  }
}

function normalizeDraft(info = []) {
  return info.map(item => {
    const camp = item.camp ?? item.effect_battle_side ?? item.battle_side
    const isPick = item.operate_type !== undefined
      ? Number(item.operate_type) === 1
      : Number(item.is_pick) === 1

    const roundIdx = item.round_index ?? item.round_idx ?? 0

    return {
      ...item,
      camp: Number(camp),
      round_idx: Number(roundIdx),
      isPick,
      heroName: heroLabel(item.hero_id),
      shortName: shortHeroName(item.hero_id)
    }
  })
}

const matchRows = computed(() => {
  if (!Array.isArray(matches.value)) return []

  return matches.value.map((row) => {
    const dynamic = row.dynamic_fields || {}
    const players = Array.isArray(row.match_players) ? row.match_players : []

    const leagueInfo = safeParseLeagueInfo(dynamic.league_round_info)
    const draft = normalizeDraft(dynamic.ban_pick_info || [])

    const leftPlayers = players
      .filter(p => Number(p.camp) === 1)
      .map(p => ({
        ...p,
        isMVP: Number(row.mvp_uid) === Number(p.player_uid),
        isSVP: Number(row.svp_uid) === Number(p.player_uid)
      }))

    const rightPlayers = players
      .filter(p => Number(p.camp) === 0)
      .map(p => ({
        ...p,
        isMVP: Number(row.mvp_uid) === Number(p.player_uid),
        isSVP: Number(row.svp_uid) === Number(p.player_uid)
      }))

    const leftTeamName = leagueInfo?.['1']?.club_team_name || 'Team 1'
    const rightTeamName = leagueInfo?.['2']?.club_team_name || 'Team 2'

    const leftScore =
      leagueInfo?.['1']?.score ??
      dynamic?.score_info?.['1'] ?? 0

    const rightScore =
      leagueInfo?.['2']?.score ??
      dynamic?.score_info?.['0'] ?? 0

    return {
      ...row,
      title: `${leftTeamName} vs ${rightTeamName}`,
      leftTeamName,
      rightTeamName,
      leftScore,
      rightScore,
      leftPlayers,
      rightPlayers,
      leftSummary: summarizeTeam(leftPlayers),
      rightSummary: summarizeTeam(rightPlayers),
      leftPicks: draft.filter(d => d.camp === 1 && d.isPick),
      leftBans: draft.filter(d => d.camp === 1 && !d.isPick),
      rightPicks: draft.filter(d => d.camp === 0 && d.isPick),
      rightBans: draft.filter(d => d.camp === 0 && !d.isPick),
      scoreLabel: `${leftScore} - ${rightScore}`,
      // stateLabel: 'Ended',
      // stateColor: 'positive',
      mapLabel: mapLabel(row.match_map_id),
      modeLabel: `Mode ${row.game_mode_id}`
    }
  })
})
// const matchRows = computed(() => {
//   return matches.value.map((row) => {
//     const leagueInfo = safeParseLeagueInfo(row.dynamic_fields?.league_round_info)
//     const draft = normalizeDraft(row.dynamic_fields?.ban_pick_info || [])

//     const leftPlayers = (row.match_players || [])
//       .filter(p => Number(p.camp) === 1)
//       .map(p => ({
//         ...p,
//         isMVP: Number(row.mvp_uid) === Number(p.player_uid),
//         isSVP: Number(row.svp_uid) === Number(p.player_uid)
//       }))

//     const rightPlayers = (row.match_players || [])
//       .filter(p => Number(p.camp) === 0)
//       .map(p => ({
//         ...p,
//         isMVP: Number(row.mvp_uid) === Number(p.player_uid),
//         isSVP: Number(row.svp_uid) === Number(p.player_uid)
//       }))

//     const leftTeamName = leagueInfo?.['1']?.club_team_name || 'Team 1'
//     const rightTeamName = leagueInfo?.['2']?.club_team_name || 'Team 2'
//     const leftScore = leagueInfo?.['1']?.score ?? row.dynamic_fields?.score_info?.['1'] ?? 0
//     const rightScore = leagueInfo?.['2']?.score ?? row.dynamic_fields?.score_info?.['0'] ?? 0

//     const leftPicks = draft.filter(d => d.camp === 1 && d.isPick)
//     const leftBans = draft.filter(d => d.camp === 1 && !d.isPick)
//     const rightPicks = draft.filter(d => d.camp === 0 && d.isPick)
//     const rightBans = draft.filter(d => d.camp === 0 && !d.isPick)

//     return {
//       ...row,
//       title: `${leftTeamName} vs ${rightTeamName}`,
//       leftTeamName,
//       rightTeamName,
//       leftScore,
//       rightScore,
//       leftPlayers,
//       rightPlayers,
//       leftSummary: summarizeTeam(leftPlayers),
//       rightSummary: summarizeTeam(rightPlayers),
//       leftPicks,
//       leftBans,
//       rightPicks,
//       rightBans,
//       stateLabel: 'Ended',
//       stateColor: 'positive',
//       mapLabel: mapLabel(row.match_map_id),
//       modeLabel: `Mode ${row.game_mode_id}`
//     }
//   })
// })

function normalizeHeroName(name = '') {
  return String(name)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, s => s.toUpperCase())
}

function toHeroFileName(name = '') {
  return String(name)
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]/g, '')
}

function heroNameOnly(heroId) {
  const hero = heroMap[Number(heroId)]
  return hero ? normalizeHeroName(hero.name) : `Hero ${heroId}`
}

function heroImage(heroId) {
  const hero = heroMap[Number(heroId)]
  if (!hero?.name) return '/imgs/heroes/empty.png'
  return `/imgs/heroes/${heroId}_${toHeroFileName(normalizeHeroName(hero.name))}.png`
}

function playerRowClass(player, team) {
  return {
    'team1-row': team === 'team1',
    'team2-row': team === 'team2',
    'team1-mvp': player.isMVP && team === 'team1',
    'team2-mvp': player.isMVP && team === 'team2',
    'team1-svp': player.isSVP && team === 'team1',
    'team2-svp': player.isSVP && team === 'team2'
  }
}

onMounted(() => {
  loadMatches()
})
</script>

<style scoped>
.matches-page {
  background: #121212;
  color: #fff;
  min-height: 100vh;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
}

.matches-table {
  background: #1b1b1f;
}

.matches-table thead tr th {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.matches-table thead {
  display: table-header-group;
}

.matches-table tbody {
  display: table-row-group;
}

.matches-table thead tr {
  background: #1b1b1f;
}

.matches-table th {
  font-weight: 600;
  color: #cbd5f5;
}

.match-row {
  background: #1b1b1f;
}

.expand-row {
  background: #18181c;
}

.expand-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 16px;
}

.overview-strip {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 12px 16px;
}

.draft-side {
  display: flex;
  align-items: center;
  gap: 12px;
}

.draft-side.right {
  justify-content: flex-end;
}

.team-label {
  font-weight: 700;
  min-width: 90px;
}

.draft-icons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mini-group {
  display: flex;
  gap: 6px;
}

.mini-group.bans .mini-hero {
  opacity: 0.75;
  border-style: dashed;
}

.mini-hero {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  background: #26262b;
}

.mini-hero.pick {
  background: #223047;
}

.mini-hero.ban {
  background: #3a2222;
}

.score-center {
  text-align: center;
}

.series-score {
  font-size: 28px;
  font-weight: 800;
}

.team-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px;
  background: #1a1a1f;
}

.team-panel-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.inner-table {
  background: transparent;
}

.score-line {
  font-size: 18px;
}

.hero-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
}

.left-strip {
  justify-content: flex-start;
}

.right-strip {
  justify-content: flex-end;
}

.hero-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero-group.bans {
  gap: 4px;
}

.hero-box {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
}

.hero-box.pick {
  width: 34px;
  height: 34px;
  background: #223047;
  font-size: 11px;
}

.hero-box.ban {
  width: 24px;
  height: 24px;
  background: #3a2222;
  font-size: 9px;
  opacity: 0.85;
}

.team-summary-cell {
  line-height: 1.8;
  min-width: 190px;
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
  font-size: 14px;
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

.team-table :deep(tbody tr:hover) {
  filter: brightness(1.06);
}

.outer-hero-thumb-wrap {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #0f172a;
  flex-shrink: 0;
}

.outer-hero-thumb {
  width: 100%;
  height: 100%;
  /* height: 80%; */
  object-fit: cover;
  transform: scale(1.2) translateY(-8%)
  /* transform: scale(1.08); */
}

.inner-hero-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 190px;
}

.inner-hero-thumb-wrap {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #0f172a;
  flex-shrink: 0;
}

.inner-hero-thumb {
  width: 100%;
  height: 100%;
  /* height: 80%; */
  object-fit: cover;
  transform: scale(1.2) translateY(-8%)
  /* transform: scale(1.08); */
}

.inner-hero-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inner-hero-name {
  font-weight: 700;
  line-height: 1.2;
}

.inner-hero-id {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.1;
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
  letter-spacing: 0.04em;
}

.player-badge.mvp {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.player-badge.svp {
  background: rgba(255, 255, 255, 0.10);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.team1-table :deep(tbody tr.team1-mvp) {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.30), rgba(37, 99, 235, 0.18)) !important;
  box-shadow: inset 4px 0 0 #60a5fa, 0 0 14px rgba(96, 165, 250, 0.28);
}

.team2-table :deep(tbody tr.team2-mvp) {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.30), rgba(185, 28, 28, 0.18)) !important;
  box-shadow: inset 4px 0 0 #f87171, 0 0 14px rgba(248, 113, 113, 0.24);
}

.team1-table :deep(tbody tr.team1-svp) {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.18), rgba(37, 99, 235, 0.10)) !important;
  box-shadow: inset 3px 0 0 rgba(147, 197, 253, 0.85);
}

.team2-table :deep(tbody tr.team2-svp) {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.18), rgba(185, 28, 28, 0.10)) !important;
  box-shadow: inset 3px 0 0 rgba(252, 165, 165, 0.85);
}
</style>

<template>
  <div class="draft-page dark">
    <div class="draft-header">
      <div class="team-panel team1">
        <div class="team-label">Camp 1</div>
        <div class="team-name">{{ teamName(1) }}</div>
      </div>

      <div class="draft-center-card">
        <div class="eyebrow">Marvel Rivals Draft</div>
        <h1>Ban / Pick Phase</h1>

        <div class="room-row">
          <span><strong>Room:</strong> {{ roomId }}</span>
          <span><strong>Steps:</strong> {{ draftRows.length }}</span>
          <span><strong>Updated:</strong> {{ updatedTime }}</span>
        </div>

        <div class="phase-status" :class="currentPhaseClass">
          <span class="pulse-dot" />
          <span>{{ currentPhaseLabel }}</span>
        </div>

        <div class="timer-grid">
          <div>
            <small>Pre Draft</small>
            <strong>{{ formatTimer(timeInfo.pre_ban_pick_time_limit) }}</strong>
          </div>
          <div>
            <small>Current Timer</small>
            <strong>{{ formatTimer(timeInfo.ban_pick_time_limit) }}</strong>
          </div>
          <div>
            <small>Announce</small>
            <strong>{{ formatTimer(timeInfo.ban_pick_announce_time_limit) }}</strong>
          </div>
        </div>
      </div>

      <div class="team-panel team2">
        <div class="team-label">Camp 2</div>
        <div class="team-name">{{ teamName(2) }}</div>
      </div>
    </div>

    <div class="control-row">
      <q-input
        v-model="manualRoomId"
        dense
        dark
        outlined
        label="Room ID"
        class="room-input"
        @keyup.enter="applyRoomId"
      />

      <q-btn dense color="primary" label="Load" :loading="loading" @click="applyRoomId" />
      <q-btn
        dense
        :color="isPolling ? 'negative' : 'positive'"
        :label="isPolling ? 'Stop Polling' : 'Start Polling'"
        @click="isPolling ? stopPolling() : startPolling()"
      />
    </div>

    <div v-if="errorMessage" class="error-box">
      {{ errorMessage }}
    </div>

    <section class="main-board">
      <div class="board-title-row">
        <h2>Draft Timeline</h2>
        <span>{{ completedCount }} completed / {{ expectedDraftLength }} expected</span>
      </div>

      <div class="draft-track">
        <div
          v-for="step in timelineSteps"
          :key="step.key"
          class="draft-card"
          :class="[
            step.actionClass,
            step.campClass,
            { empty: !step.heroId, active: step.isActive }
          ]"
        >
          <div class="draft-card-top">
            <span>{{ step.roundLabel }}</span>
            <strong>{{ step.actionLabel }}</strong>
          </div>

          <div class="hero-preview">
            <img
              :src="heroImage(step.heroId)"
              :alt="heroLabel(step)"
              @error="e => (e.target.src = '/imgs/heroes/0_unknown.png')"
            />
          </div>

          <div class="hero-name">{{ heroLabel(step) }}</div>
          <div class="camp-pill" :class="step.campClass">{{ step.campLabel }}</div>
        </div>
      </div>
    </section>

    <section class="main-board draft-table-board">
      <div class="board-title-row">
        <h2>Round View</h2>
        <span>Grouped by round index</span>
      </div>

      <div class="table-wrap">
        <table class="draft-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Action</th>
              <th>Camp 1</th>
              <th>Camp 2</th>
              <th>Mode Order</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="round in groupedRounds" :key="round.roundIndex">
              <td>Round {{ round.roundIndex + 1 }}</td>
              <td>
                <span class="action-chip" :class="round.actionClass">
                  {{ round.actionLabel }}
                </span>
              </td>
              <td>
                <DraftCell :step="round.camp1" />
              </td>
              <td>
                <DraftCell :step="round.camp2" />
              </td>
              <td>{{ round.modeOrderLabel }}</td>
            </tr>

            <tr v-if="!groupedRounds.length">
              <td colspan="5" class="empty-state">
                No draft data yet. Enter a room ID and load `/realtime_ban_pick`.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useSeshStore } from 'src/stores/sesh'

const route = useRoute()
const router = useRouter()
const seshStore = useSeshStore()

const loading = ref(false)
const isPolling = ref(false)
const pollTimer = ref(null)
const errorMessage = ref('')
const updatedAt = ref(null)

const manualRoomId = ref(String(route.query?.roomId || seshStore.room || ''))
const currentRoomId = ref(String(route.query?.roomId || seshStore.room || ''))

const rawDraft = ref([])
const timeInfo = ref({
  pre_ban_pick_time_limit: null,
  ban_pick_time_limit: null,
  ban_pick_announce_time_limit: null,
})

const teams = ref({
  1: { name: 'Camp 1', miniName: 'C1' },
  2: { name: 'Camp 2', miniName: 'C2' },
})

const roomId = computed(() => currentRoomId.value || '-')
const updatedTime = computed(() => {
  if (!updatedAt.value) return '-'
  return new Date(updatedAt.value).toLocaleTimeString()
})

const expectedDraftLength = computed(() => Math.max(12, rawDraft.value.length))
const completedCount = computed(() => rawDraft.value.filter(item => Number(item?.hero_id || 0) > 0).length)

const draftRows = computed(() => {
  return [...rawDraft.value]
    .map((item, index) => normalizeDraftStep(item, index))
    .sort((a, b) => {
      if (a.roundIndex !== b.roundIndex) return a.roundIndex - b.roundIndex
      if (a.camp !== b.camp) return a.camp - b.camp
      return a.originalIndex - b.originalIndex
    })
})

const timelineSteps = computed(() => {
  if (!draftRows.value.length) return buildPlaceholderSteps()

  const rows = draftRows.value.map((step, index) => ({
    ...step,
    isActive: index === completedCount.value,
  }))

  while (rows.length < expectedDraftLength.value) {
    const index = rows.length
    rows.push({
      key: `placeholder-${index}`,
      roundIndex: index,
      roundLabel: `Round ${index + 1}`,
      actionLabel: 'WAITING',
      actionClass: 'waiting',
      camp: null,
      campLabel: 'TBD',
      campClass: 'neutral',
      heroId: null,
      heroName: '',
      isActive: index === completedCount.value,
    })
  }

  return rows
})

const groupedRounds = computed(() => {
  const groups = new Map()

  for (const step of draftRows.value) {
    if (!groups.has(step.roundIndex)) {
      groups.set(step.roundIndex, {
        roundIndex: step.roundIndex,
        actionLabel: step.actionLabel,
        actionClass: step.actionClass,
        modeOrderLabel: modeOrderLabel(step.modeOrderType),
        camp1: null,
        camp2: null,
      })
    }

    const group = groups.get(step.roundIndex)
    group.actionLabel = mergeActionLabel(group.actionLabel, step.actionLabel)
    group.actionClass = group.actionLabel.includes('PICK') ? 'pick' : 'ban'
    group.modeOrderLabel = modeOrderLabel(step.modeOrderType)

    if (step.camp === 1) group.camp1 = step
    if (step.camp === 2) group.camp2 = step
  }

  return [...groups.values()].sort((a, b) => a.roundIndex - b.roundIndex)
})

const currentPhaseLabel = computed(() => {
  const active = timelineSteps.value.find(step => step.isActive)
  if (!active || active.actionClass === 'waiting') return 'Waiting for next draft action'
  return `${active.actionLabel} · ${active.campLabel}`
})

const currentPhaseClass = computed(() => {
  const active = timelineSteps.value.find(step => step.isActive)
  return active?.actionClass || 'waiting'
})

async function loadDraft() {
  if (!currentRoomId.value && currentRoomId.value !== '120001') return

  try {
    loading.value = true
    errorMessage.value = ''

    const response = await api.get(`/realtime_ban_pick/${currentRoomId.value}`)
    const payload = response?.data?.data ?? response?.data ?? {}

    rawDraft.value = extractBanPickInfo(payload)
    timeInfo.value = {
      ...timeInfo.value,
      ...(payload?.ban_pick_time_info || payload?.timeInfo || {}),
    }

    teams.value = extractTeams(payload)
    updatedAt.value = new Date().toISOString()
  } catch (err) {
    console.error('Failed to load draft:', err)
    errorMessage.value = err?.response?.data?.message || err?.message || 'Failed to load realtime ban/pick data.'
  } finally {
    loading.value = false
  }
}

function startPolling() {
  stopPolling()
  isPolling.value = true
  loadDraft()
  pollTimer.value = setInterval(loadDraft, 500)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
  isPolling.value = false
}

function applyRoomId() {
  const nextRoomId = String(manualRoomId.value || '').trim()
  if (!nextRoomId) return

  currentRoomId.value = nextRoomId
  router.replace({ query: { ...route.query, roomId: nextRoomId } })
  loadDraft()
}

function extractBanPickInfo(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.ban_pick_info)) return payload.ban_pick_info
  if (Array.isArray(payload?.data?.ban_pick_info)) return payload.data.ban_pick_info
  if (Array.isArray(payload?.Draft)) return payload.Draft
  if (Array.isArray(payload?.draft)) return payload.draft
  return []
}

function extractTeams(payload) {
  const groupInfo = payload?.group_info || payload?.room?.group_info || payload?.meta?.group_info

  if (groupInfo) {
    return {
      1: {
        name: groupInfo?.['1']?.name || 'Camp 1',
        miniName: groupInfo?.['1']?.mini_name || groupInfo?.['1']?.miniName || 'C1',
      },
      2: {
        name: groupInfo?.['2']?.name || 'Camp 2',
        miniName: groupInfo?.['2']?.mini_name || groupInfo?.['2']?.miniName || 'C2',
      },
    }
  }

  return {
    1: { name: payload?.meta?.team1Name || 'Camp 1', miniName: payload?.meta?.team1MiniName || 'C1' },
    2: { name: payload?.meta?.team2Name || 'Camp 2', miniName: payload?.meta?.team2MiniName || 'C2' },
  }
}

function normalizeDraftStep(item, index) {
  const roundIndex = Number(item.round_index ?? item.round ?? item.roundIndex ?? index)
  const operateType = Number(item.operate_type ?? item.type ?? -1)
  const camp = Number(item.camp ?? item.battle_side ?? 0)
  const heroId = item.hero_id ?? item.heroId ?? null
  const actionLabel = operateType === 0 ? 'BAN' : operateType === 1 ? 'PICK' : 'WAITING'
  const actionClass = operateType === 0 ? 'ban' : operateType === 1 ? 'pick' : 'waiting'

  return {
    ...item,
    key: `${roundIndex}-${camp}-${heroId || 'empty'}-${index}`,
    originalIndex: index,
    roundIndex,
    roundLabel: `Round ${roundIndex + 1}`,
    operateType,
    actionLabel,
    actionClass,
    camp,
    campLabel: camp === 1 ? teamName(1) : camp === 2 ? teamName(2) : 'Neutral',
    campClass: camp === 1 ? 'team1' : camp === 2 ? 'team2' : 'neutral',
    heroId,
    heroName: item.hero_name || item.heroName || '',
    modeOrderType: item.mode_order_type,
  }
}

function buildPlaceholderSteps() {
  return Array.from({ length: 12 }, (_, index) => ({
    key: `placeholder-${index}`,
    roundIndex: index,
    roundLabel: `Round ${index + 1}`,
    actionLabel: 'WAITING',
    actionClass: 'waiting',
    camp: null,
    campLabel: 'TBD',
    campClass: 'neutral',
    heroId: null,
    heroName: '',
    isActive: index === 0,
  }))
}

function teamName(camp) {
  return teams.value?.[camp]?.miniName || teams.value?.[camp]?.name || `Camp ${camp}`
}

function heroLabel(step) {
  if (!step?.heroId) return 'Waiting'
  return step.heroName || `Hero ${step.heroId}`
}

function heroImage(heroId) {
  if (!heroId) return '/imgs/heroes/0_unknown.png'
  return `/imgs/heroes/${heroId}.png`
}

function modeOrderLabel(value) {
  if (Number(value) === 1) return 'Simultaneous'
  if (Number(value) === 0) return 'Sequential'
  return '-'
}

function mergeActionLabel(a, b) {
  if (a === b) return a
  if ([a, b].includes('PICK')) return 'PICK / BAN'
  return a || b || '-'
}

function formatTimer(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '-'
  if (num < 0) return 'Ended'

  const total = Math.ceil(num)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const DraftCell = defineComponent({
  name: 'DraftCell',
  props: {
    step: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    return () => {
      if (!props.step) {
        return h('div', { class: 'draft-cell empty-cell' }, '-')
      }

      return h('div', { class: 'draft-cell' }, [
        h('img', {
          src: heroImage(props.step.heroId),
          alt: heroLabel(props.step),
          onError: event => {
            event.target.src = '/imgs/heroes/0_unknown.png'
          },
        }),
        h('div', { class: 'draft-cell-text' }, [
          h('strong', heroLabel(props.step)),
          h('span', `ID ${props.step.heroId || '-'}`),
        ]),
      ])
    }
  },
})

watch(
  () => route.query.roomId,
  value => {
    if (!value) return
    manualRoomId.value = String(value)
    currentRoomId.value = String(value)
    loadDraft()
  }
)

onMounted(() => {
  if (currentRoomId.value !== '120001') startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped>
.draft-page.dark {
  min-height: 100vh;
  background: #0b0f14;
  color: #e5e7eb;
  padding: 20px;
}

.draft-header {
  display: grid;
  grid-template-columns: 180px 1fr 180px;
  gap: 16px;
  align-items: stretch;
}

.team-panel,
.draft-center-card,
.main-board {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.86);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
}

.team-panel {
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}

.team-panel.team1 {
  border-color: rgba(59, 130, 246, 0.45);
}

.team-panel.team2 {
  border-color: rgba(239, 68, 68, 0.45);
}

.team-label,
.eyebrow {
  color: #94a3b8;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.team-name {
  margin-top: 8px;
  font-size: 36px;
  font-weight: 900;
}

.draft-center-card {
  border-radius: 22px;
  padding: 18px 24px;
  text-align: center;
}

.draft-center-card h1 {
  margin: 4px 0 10px;
  font-size: 34px;
  line-height: 1;
}

.room-row,
.timer-grid,
.control-row,
.board-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.room-row {
  color: #cbd5e1;
  font-size: 13px;
}

.phase-status {
  width: fit-content;
  margin: 14px auto;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  font-weight: 800;
}

.phase-status.ban {
  background: rgba(239, 68, 68, 0.18);
  color: #fecaca;
}

.phase-status.pick {
  background: rgba(34, 197, 94, 0.16);
  color: #bbf7d0;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.08);
}

.timer-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 10px;
}

.timer-grid div {
  border-radius: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.timer-grid small,
.timer-grid strong {
  display: block;
}

.timer-grid small {
  color: #94a3b8;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.timer-grid strong {
  margin-top: 4px;
  font-size: 18px;
}

.control-row {
  justify-content: flex-start;
  margin: 18px 0;
}

.room-input {
  width: 280px;
}

.error-box {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.14);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.main-board {
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 18px;
}

.board-title-row {
  justify-content: space-between;
  margin-bottom: 16px;
}

.board-title-row h2 {
  margin: 0;
  font-size: 20px;
}

.board-title-row span {
  color: #94a3b8;
  font-size: 13px;
}

.draft-track {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.draft-card {
  position: relative;
  min-height: 210px;
  border-radius: 18px;
  padding: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
}

.draft-card.ban {
  border-color: rgba(239, 68, 68, 0.35);
}

.draft-card.pick {
  border-color: rgba(34, 197, 94, 0.35);
}

.draft-card.team1 {
  box-shadow: inset 3px 0 0 #3b82f6;
}

.draft-card.team2 {
  box-shadow: inset 3px 0 0 #ef4444;
}

.draft-card.active {
  outline: 2px solid rgba(250, 204, 21, 0.65);
}

.draft-card.empty {
  opacity: 0.55;
}

.draft-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.draft-card-top strong {
  color: #fff;
  font-size: 13px;
}

.hero-preview {
  width: 94px;
  height: 94px;
  margin: 18px auto 12px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-name {
  min-height: 36px;
  text-align: center;
  font-weight: 900;
  font-size: 15px;
}

.camp-pill,
.action-chip {
  width: fit-content;
  margin: 10px auto 0;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.camp-pill.team1 {
  background: rgba(59, 130, 246, 0.22);
  color: #bfdbfe;
}

.camp-pill.team2 {
  background: rgba(239, 68, 68, 0.22);
  color: #fecaca;
}

.camp-pill.neutral {
  background: rgba(148, 163, 184, 0.18);
  color: #cbd5e1;
}

.table-wrap {
  overflow-x: auto;
}

.draft-table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
}

.draft-table th,
.draft-table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}

.draft-table th {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.04);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.action-chip {
  margin: 0;
  display: inline-flex;
}

.action-chip.ban {
  background: rgba(239, 68, 68, 0.18);
  color: #fecaca;
}

.action-chip.pick {
  background: rgba(34, 197, 94, 0.16);
  color: #bbf7d0;
}

.draft-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.draft-cell img {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.06);
}

.draft-cell-text strong,
.draft-cell-text span {
  display: block;
}

.draft-cell-text span {
  color: #94a3b8;
  font-size: 12px;
}

.empty-cell,
.empty-state {
  color: #94a3b8;
}

@media (max-width: 900px) {
  .draft-header {
    grid-template-columns: 1fr;
  }

  .timer-grid {
    grid-template-columns: 1fr;
  }
}
</style>

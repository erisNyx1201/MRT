const express = require('express')
const router = express.Router()
const axios = require('axios')

let loopTimer = null

const XPRESSION_URL = 'http://localhost:9000/api/xpression' // change if needed

// -----------------------------
// Draft Generator
// -----------------------------
function buildDraftLoop({ firstPickerPhase1 } = {}) {
  const first =
    firstPickerPhase1 === 1 || firstPickerPhase1 === 2
      ? firstPickerPhase1
      : Math.random() < 0.5
        ? 1
        : 2

  const second = first === 1 ? 2 : 1
  const opposite = (camp) => (camp === 1 ? 2 : 1)

  const steps = [
    { round_index: 0, operate_type: 0, camp: 1, simultaneous: true },
    { round_index: 0, operate_type: 0, camp: 2, simultaneous: true },

    { round_index: 1, operate_type: 1, camp: first },
    { round_index: 2, operate_type: 1, camp: opposite(first) },
    { round_index: 3, operate_type: 1, camp: first },
    { round_index: 4, operate_type: 1, camp: opposite(first) },

    { round_index: 5, operate_type: 0, camp: 1, simultaneous: true },
    { round_index: 5, operate_type: 0, camp: 2, simultaneous: true },

    { round_index: 6, operate_type: 1, camp: second },
    { round_index: 7, operate_type: 1, camp: opposite(second) },
    { round_index: 8, operate_type: 1, camp: second },
    { round_index: 9, operate_type: 1, camp: opposite(second) }
  ]

  return {
    firstPickerPhase1: first,
    firstPickerPhase2: second,
    steps
  }
}

// -----------------------------
// Helper → Xpression format
// -----------------------------
function mapToXpressionStep(step, heroId = null) {
  return {
    round: step.round_index,
    type: step.operate_type === 1 ? 'PICK' : 'BAN',
    camp: step.camp,
    hero_id: heroId
  }
}

// -----------------------------
// GET /draft/loop
// -----------------------------
router.get('/loop', (req, res) => {
  const firstPickerPhase1 = Number(req.query.first || 0)

  const result = buildDraftLoop({ firstPickerPhase1 })

  res.json({ ok: true, ...result })
})

// -----------------------------
// GET /draft/xpression/loop/start
// -----------------------------
router.get('/xpression/loop/start', async (req, res) => {
  try {
    const firstPickerPhase1 = Number(req.query.first || 0)
    const interval = Number(req.query.interval || 1500)

    const loop = buildDraftLoop({ firstPickerPhase1 })

    let index = 0

    if (loopTimer) clearInterval(loopTimer)

    loopTimer = setInterval(async () => {
      const step = loop.steps[index]

      const payload = {
        Draft: [mapToXpressionStep(step)]
      }

      try {
        await axios.post(XPRESSION_URL, payload)
        console.log('Xpression Loop Step:', payload)
      } catch (err) {
        console.error('Xpression error:', err.message)
      }

      index++
      if (index >= loop.steps.length) index = 0
    }, interval)

    res.json({
      ok: true,
      message: 'Loop started',
      interval,
      loop
    })
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message })
  }
})

// -----------------------------
// GET /draft/xpression/loop/stop
// -----------------------------
router.get('/xpression/loop/stop', (req, res) => {
  if (loopTimer) {
    clearInterval(loopTimer)
    loopTimer = null
  }

  res.json({ ok: true, message: 'Loop stopped' })
})

// -----------------------------
// GET /draft/xpression/live
// Pass draft via query (encoded JSON)
// -----------------------------
router.get('/xpression/live', async (req, res) => {
  try {
    if (!req.query.data) {
      return res.status(400).json({
        ok: false,
        message: 'Missing draft data'
      })
    }

    const Draft = JSON.parse(decodeURIComponent(req.query.data))

    const mapped = Draft.map(item => ({
      round: item.round_index,
      type: item.operate_type === 1 ? 'PICK' : 'BAN',
      camp: item.camp,
      hero_id: item.hero_id
    }))

    const payload = { Draft: mapped }

    await axios.post(XPRESSION_URL, payload)

    res.json({ ok: true, payload })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, message: error.message })
  }
})

// -----------------------------
// GET /draft/xpression/step
// Manual trigger
// -----------------------------
router.get('/xpression/step', async (req, res) => {
  try {
    const round = Number(req.query.round || 0)
    const camp = Number(req.query.camp || 1)
    const type = req.query.type === 'pick' ? 1 : 0

    const payload = {
      Draft: [
        {
          round,
          type: type === 1 ? 'PICK' : 'BAN',
          camp,
          hero_id: Number(req.query.hero || 0)
        }
      ]
    }

    await axios.post(XPRESSION_URL, payload)

    res.json({ ok: true, payload })
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message })
  }
})

module.exports = router
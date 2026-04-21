const express = require('express')
const router = express.Router()

function buildDraftLoop({ firstPickerPhase1 } = {}) {
  const first = firstPickerPhase1 === 1 || firstPickerPhase1 === 2
    ? firstPickerPhase1
    : (Math.random() < 0.5 ? 1 : 2)

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

router.post('/loop', async (req, res) => {
  try {
    const { firstPickerPhase1 } = req.body || {}
    const result = buildDraftLoop({ firstPickerPhase1 })
    res.json({ ok: true, ...result })
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message })
  }
})

module.exports = router
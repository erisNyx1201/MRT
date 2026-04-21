/***************************
 * Team Routes
 *
 * Handles fetching and saving team data.
 ***************************/
const express = require('express')
const router = express.Router()
const Team = require('../models/Team')
const { dbLogger } = require('../modules/logger')

/**
 * Normalize incoming payload so it matches Mongo shape
 */
function normalizeTeamPayload(payload = {}) {
  return {
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
    id: typeof payload.id === 'string' ? payload.id.trim() : '',
    type: typeof payload.type === 'number' ? payload.type : null,
    active: Boolean(payload.active),
    players: Array.isArray(payload.players)
      ? payload.players.map((player = {}) => ({
          name: typeof player.name === 'string' ? player.name.trim() : '',
          uid: typeof player.uid === 'string' ? player.uid.trim() : '',
          flag: typeof player.flag === 'string' ? player.flag.trim() : '',
        }))
      : [],
  }
}

/**
 * GET /api/teams
 * Get all teams
 */
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .sort({ active: -1, name: 1, createdAt: -1 })
      .lean()

    res.json(teams)
  } catch (err) {
    dbLogger.error('Error fetching teams:', err)
    res.status(500).json({
      message: 'Failed to get teams',
      error: err.message,
    })
  }
})

/**
 * GET /api/teams/:id
 * Get single team by id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const team = await Team.findOne({ id }).lean()

    if (!team) {
      dbLogger.warn(`Team not found: ${id}`)
      return res.status(404).json({ message: 'Team not found' })
    }

    res.json(team)
  } catch (err) {
    dbLogger.error(`Error fetching team ${req.params.id}:`, err)
    res.status(500).json({
      message: 'Failed to get team',
      error: err.message,
    })
  }
})

/**
 * POST /api/teams
 * Create new team
 */
router.post('/', async (req, res) => {
  try {
    const payload = req.body

    if (!payload || typeof payload.id !== 'string' || !payload.id.trim()) {
      return res.status(400).json({
        message: 'team id is required',
      })
    }

    const normalized = normalizeTeamPayload(payload)

    const existing = await Team.findOne({ id: normalized.id })
    if (existing) {
      return res.status(409).json({
        message: 'Team with this id already exists',
      })
    }

    const created = await Team.create(normalized)

    res.status(201).json(created)
  } catch (err) {
    dbLogger.error('Error creating team:', err)
    res.status(500).json({
      message: 'Failed to create team',
      error: err.message,
    })
  }
})

/**
 * PUT /api/teams/:id
 * Update existing team by id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const payload = req.body

    const normalized = normalizeTeamPayload(payload)

    const updated = await Team.findOneAndUpdate(
      { id },
      { $set: normalized },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!updated) {
      dbLogger.warn(`Team not found for update: ${id}`)
      return res.status(404).json({ message: 'Team not found' })
    }

    res.json(updated)
  } catch (err) {
    dbLogger.error(`Error updating team ${req.params.id}:`, err)
    res.status(500).json({
      message: 'Failed to update team',
      error: err.message,
    })
  }
})

/**
 * POST /api/teams/save
 * Save or update single team
 * Optional helper route if you want matchRoutes-style upsert
 */
router.post('/save', async (req, res) => {
  try {
    const payload = req.body

    if (!payload || typeof payload.id !== 'string' || !payload.id.trim()) {
      return res.status(400).json({
        message: 'team id is required',
      })
    }

    const normalized = normalizeTeamPayload(payload)

    const saved = await Team.findOneAndUpdate(
      { id: normalized.id },
      { $set: normalized },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )

    res.json(saved)
  } catch (err) {
    dbLogger.error('Error saving team:', err)
    res.status(500).json({
      message: 'Failed to save team',
      error: err.message,
    })
  }
})

/**
 * DELETE /api/teams/:id
 * Delete team by id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await Team.findOneAndDelete({ id })

    if (!deleted) {
      dbLogger.warn(`Team not found for delete: ${id}`)
      return res.status(404).json({ message: 'Team not found' })
    }

    res.json({
      message: 'Team deleted successfully',
      id,
    })
  } catch (err) {
    dbLogger.error(`Error deleting team ${req.params.id}:`, err)
    res.status(500).json({
      message: 'Failed to delete team',
      error: err.message,
    })
  }
})

module.exports = router
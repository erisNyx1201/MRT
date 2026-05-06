const express = require("express");
const router = express.Router();

const Series = require("../models/Series");
const Match = require("../models/Match");

router.get('/', async (req, res) => {
  try {
    const series = await Series.find()
      .sort({ updatedAt: -1 })
      .lean()

    const matchUids = series.flatMap(s => s.matches || [])

    const matches = await Match.find({
      match_uid: { $in: matchUids }
    }).lean()

    const matchMap = Object.fromEntries(
      matches.map(m => [m.match_uid, m])
    )

    const result = series.map(s => ({
      ...s,
      matchDetails: (s.matches || [])
        .map(uid => matchMap[uid])
        .filter(Boolean)
    }))

    res.json(result)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Failed to fetch series',
      error: err.message,
    })
  }
})

router.get("/:roomId", async (req, res) => {
  try {
    const roomId = String(req.params.roomId);

    const series = await Series.findOne({
      room_id: roomId,
    });

    if (!series) {
      return res.status(404).json({
        message: "Series not found",
      });
    }

    const matches = await Match.find({
      match_uid: { $in: series.matches },
    }).sort({
      match_time_stamp: 1,
    });

    res.json({
      series,
      matches,
    });
  } catch (err) {
    console.error("Failed to fetch series:", err);

    res.status(500).json({
      message: "Failed to fetch series",
      error: err.message,
    });
  }
});

module.exports = router;
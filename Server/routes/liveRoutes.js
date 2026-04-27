const express = require("express");
const router = express.Router();

const heroesRaw = require("../../Client/src/assets/heroes_UO.json");
// const mapsRaw = require('../assets/maps_UO.json');
const mapsRaw = require("../../Client/src/assets/maps.json");

const { apiLogger } = require("../modules/logger");
const {
  getRoomList,
  getRealtimeBanPick,
  getBattleStatistics,
  getReplayQueryMatch,
} = require("../services/liveService");
const { processLiveData } = require("../services/processLiveData");

const heroMap = Object.fromEntries(
  (Array.isArray(heroesRaw) ? heroesRaw : []).map((hero) => [
    String(hero.id),
    hero,
  ]),
);

const mapMap = Object.fromEntries(
  (Array.isArray(mapsRaw) ? mapsRaw : []).map((map) => [String(map.id), map]),
);

/**
 * GET /api/live/rooms
 */
router.get("/rooms", async (req, res) => {
  try {
    const data = await getRoomList();
    // console.log('Fetched room list:', data);
    res.json(data);
  } catch (err) {
    apiLogger.error("Error fetching room list:", err);
    res.status(500).json({
      message: "Failed to fetch room list",
      error: err.message,
    });
  }
});

/**
 * GET /api/live/ban-pick/:roomId
 */
router.get("/ban-pick/:roomId", async (req, res) => {
  try {
    const data = await getRealtimeBanPick(req.params.roomId);
    res.json(data);
  } catch (err) {
    apiLogger.error(
      `Error fetching realtime ban pick ${req.params.roomId}:`,
      err,
    );
    res.status(500).json({
      message: "Failed to fetch realtime ban pick",
      error: err.message,
    });
  }
});

/**
 * GET /api/live/battle/:roomId
 */
/**
 * GET /api/live/battle/:roomId
 * Fetches battle stats, then returns processed UI-ready data
 */
router.get("/battle/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const battleStats = await getBattleStatistics(roomId);

    const rawLiveData = battleStats?.data || battleStats || {};

    const processed = processLiveData(rawLiveData, {
      heroMap,
      mapMap,
    });

    res.json(processed);
  } catch (err) {
    apiLogger.error(
      `Error fetching processed battle statistics ${req.params.roomId}:`,
      err,
    );
    res.status(500).json({
      message: "Failed to fetch processed battle statistics",
      error: err.message,
    });
  }
});
// router.get('/battle/:roomId', async (req, res) => {
//   try {
//     const data = await getBattleStatistics(req.params.roomId);
//     res.json(data);
//   } catch (err) {
//     apiLogger.error(`Error fetching battle statistics ${req.params.roomId}:`, err);
//     res.status(500).json({
//       message: 'Failed to fetch battle statistics',
//       error: err.message,
//     });
//   }
// });

/**
 * GET /api/live/dashboard/:roomId
 * Fetches battle stats + ban/pick, then returns processed UI-ready data
 */
// router.get('/dashboard/:roomId', async (req, res) => {
//   try {
//     const roomId = req.params.roomId;

//     const [battleStats, banPick] = await Promise.all([
//       getBattleStatistics(roomId),
//       getRealtimeBanPick(roomId),
//     ]);

//     // Adjust this depending on the official API's exact envelope.
//     const rawLiveData = {
//       ...(battleStats?.data || battleStats || {}),
//       ban_pick_info:
//         banPick?.data?.ban_pick_info ||
//         banPick?.data ||
//         banPick?.ban_pick_info ||
//         [],
//     };

//     const processed = processLiveData(rawLiveData, {
//       heroMap,
//       mapMap,
//     });

//     res.json(processed);
//   } catch (err) {
//     apiLogger.error(`Error building live dashboard ${req.params.roomId}:`, err);
//     res.status(500).json({
//       message: 'Failed to fetch live dashboard data',
//       error: err.message,
//     });
//   }
// });

/**
 * POST /api/live/replay-query-match
 */
router.post("/replay-query-match", async (req, res) => {
  try {
    const data = await getReplayQueryMatch(req.body || {});
    const match = data?.data?.matches?.[0] || null;
    res.json(match);
  } catch (err) {
    apiLogger.error("Error fetching replay_query_match:", err);
    res.status(500).json({
      message: "Failed to fetch replay query match",
      error: err.message,
    });
  }
});

module.exports = router;

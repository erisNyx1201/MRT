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

//#region helper functions
function buildLiveDraft(data = [], { firstPickerPhase1 } = {}) {
  const actualFirstPicker =
    firstPickerPhase1 === 1 || firstPickerPhase1 === 2
      ? firstPickerPhase1
      : inferFirstPickerPhase1(data);

  const plan = buildDraftPlan(actualFirstPicker || 1);

  const Draft = data.map((item) => {
    const hero = heroMap[String(item.cur_pick_hero)];

    return {
      round: Number(item.round_index),
      type: Number(item.operate_type) === 1 ? "PICK" : "BAN",
      camp: Number(item.camp),
      hero_id: item.cur_pick_hero ?? null,
      hero_name: hero?.name?.toUpperCase() || `Hero ${item.cur_pick_hero}`,
    };
  });

  if (!Draft.length) {
    return {
      Draft,
      meta: {
        current_round: -1,
        phase: "BAN",
        active_camp: null,
      },
    };
  }

  const roundCounts = Draft.reduce((acc, item) => {
    acc[item.round] = (acc[item.round] || 0) + 1;
    return acc;
  }, {});

  let nextRoundMeta = null;

  for (const round of plan.rounds) {
    const count = roundCounts[round.round_index] || 0;
    if (count < round.expected_count) {
      nextRoundMeta = round;
      break;
    }
  }

  if (!nextRoundMeta) {
    return {
      Draft,
      meta: {
        current_round: 10,
        phase: "END",
        active_camp: null,
      },
    };
  }

  return {
    Draft,
    meta: {
      current_round: nextRoundMeta.round_index,
      phase: nextRoundMeta.phase,
      active_camp: nextRoundMeta.camp,
    },
  };
}

function inferFirstPickerPhase1(data = []) {
  const round1 = data.find((item) => Number(item.round_index) === 1);
  if (round1 && (Number(round1.camp) === 1 || Number(round1.camp) === 2)) {
    return Number(round1.camp);
  }
  return null;
}

// Helper to build the full draft plan based on first picker in phase 1
function buildDraftPlan(firstPickerPhase1) {
  const first =
    firstPickerPhase1 === 1 || firstPickerPhase1 === 2 ? firstPickerPhase1 : 1;

  const second = first === 1 ? 2 : 1;

  return {
    firstPickerPhase1: first,
    firstPickerPhase2: second,
    rounds: [
      { round_index: 0, phase: "BAN", camp: "BOTH", expected_count: 2 },

      { round_index: 1, phase: "PICK", camp: first, expected_count: 1 },
      { round_index: 2, phase: "BAN", camp: second, expected_count: 1 },
      { round_index: 3, phase: "PICK", camp: second, expected_count: 1 },
      { round_index: 4, phase: "BAN", camp: first, expected_count: 1 },

      { round_index: 5, phase: "BAN", camp: "BOTH", expected_count: 2 },

      { round_index: 6, phase: "PICK", camp: second, expected_count: 1 },
      { round_index: 7, phase: "BAN", camp: first, expected_count: 1 },
      { round_index: 8, phase: "PICK", camp: first, expected_count: 1 },
      { round_index: 9, phase: "BAN", camp: second, expected_count: 1 },
    ],
  };
}

//#region routes live data
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

/**
 * GET /api/live/battle/:roomId
 */
router.get('/rawbattle/:roomId', async (req, res) => {
  try {
    const data = await getBattleStatistics(req.params.roomId);
    res.json(data);
  } catch (err) {
    apiLogger.error(`Error fetching battle statistics ${req.params.roomId}:`, err);
    res.status(500).json({
      message: 'Failed to fetch battle statistics',
      error: err.message,
    });
  }
});

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

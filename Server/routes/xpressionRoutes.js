/***************************
 * Xpression Draft Routes
 *
 * Handles draft (ban/pick) data for Xpression.
 ***************************/
const express = require("express");
const router = express.Router();
const { xpressionLogger } = require("../modules/logger");

const heroesRaw = require("../../Client/src/assets/heroes_UO.json");

// Hardcoded draft data from ban_pick_info
const hardcodedDraftData = [
  {
    operate_type: 0,
    battle_side: 1,
    hero_id: 1011,
    round_index: 0,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 1,
    votes: [],
    conf_id: 2004,
    camp: 2,
  },
  {
    operate_type: 0,
    battle_side: 0,
    hero_id: 1021,
    round_index: 0,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 1,
    votes: [],
    conf_id: 2004,
    camp: 1,
  },
  {
    operate_type: 1,
    battle_side: 0,
    hero_id: 1051,
    round_index: 1,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 0,
    votes: [],
    conf_id: 2004,
    camp: 1,
  },
  {
    operate_type: 0,
    battle_side: 1,
    hero_id: 1029,
    round_index: 2,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 0,
    votes: [],
    conf_id: 2004,
    camp: 2,
  },
  {
    operate_type: 1,
    battle_side: 1,
    hero_id: 1024,
    round_index: 3,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 0,
    votes: [],
    conf_id: 2004,
    camp: 2,
  },
  {
    operate_type: 0,
    battle_side: 0,
    hero_id: 1036,
    round_index: 4,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 0,
    votes: [],
    conf_id: 2004,
    camp: 1,
  },
  {
    operate_type: 0,
    battle_side: 1,
    hero_id: 1034,
    round_index: 5,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 1,
    votes: [],
    conf_id: 2004,
    camp: 2,
  },
  {
    operate_type: 0,
    battle_side: 0,
    hero_id: 1038,
    round_index: 5,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 1,
    votes: [],
    conf_id: 2004,
    camp: 1,
  },
  {
    operate_type: 1,
    battle_side: 1,
    hero_id: 1029,
    round_index: 6,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 0,
    votes: [],
    conf_id: 2004,
    camp: 2,
  },
  {
    operate_type: 0,
    battle_side: 0,
    hero_id: 1045,
    round_index: 7,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 0,
    votes: [],
    conf_id: 2004,
    camp: 1,
  },
  {
    operate_type: 1,
    battle_side: 0,
    hero_id: 1026,
    round_index: 8,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 0,
    votes: [],
    conf_id: 2004,
    camp: 1,
  },
  {
    operate_type: 0,
    battle_side: 1,
    hero_id: 1056,
    round_index: 9,
    ban_pick_num: 1,
    is_only_one_side: true,
    mode_order_type: 0,
    votes: [],
    conf_id: 2004,
    camp: 2,
  },
];

let lastDraftData = [...hardcodedDraftData];
let loopTimer = null;
let loopIndex = 0;

// Helper to format time as HH:mm:ss
function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
}

const heroMap = Object.fromEntries(
  heroesRaw.map((hero) => [String(hero.id), hero]),
);

function buildDraft(data = [], { firstPickerPhase1 } = {}, isLive = false) {
  const actualFirstPicker =
    firstPickerPhase1 === 1 || firstPickerPhase1 === 2
      ? firstPickerPhase1
      : inferFirstPickerPhase1(data);

  const plan = buildDraftPlan(actualFirstPicker || 1);

  const Draft = data.map((item) => {
    if (isLive) {
      const hero = heroMap[String(item.cur_pick_hero)];

      return {
        round: Number(item.round_index),
        type: Number(item.operate_type) === 1 ? "PICK" : "BAN",
        camp: Number(item.camp),
        hero_id: item.cur_pick_hero ?? null,
        hero_name: hero?.name?.toUpperCase() || `Hero ${item.cur_pick_hero}`,
      };
    } else {
      const hero = heroMap[String(item.hero_id)];

      return {
        round: Number(item.round_index),
        type: Number(item.operate_type) === 1 ? "PICK" : "BAN",
        camp: Number(item.camp),
        hero_id: item.hero_id ?? null,
        hero_name: hero?.name?.toUpperCase() || `Hero ${item.hero_id}`,
      };
    }
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

// POST route to receive live draft data
router.post("/draft", (req, res) => {
  const data = req.body;

  xpressionLogger.info("📡 Received draft data for Xpression");

  lastDraftData = Array.isArray(data) ? data : data?.Draft || [];

  res.status(200).json({
    message: "✅ Draft data received",
    data: lastDraftData,
  });
});

// GET route to retrieve the latest draft data
router.get("/draft", (req, res) => {
  if (lastDraftData?.length) {
    res.json(buildDraft(lastDraftData));
  } else {
    res.json({
      message: `⚠️ No draft data received yet (as of ${getCurrentTime()})`,
    });
  }
});

// GET route to reset back to the full hardcoded draft
router.get("/draft/reset", (req, res) => {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }

  loopIndex = 0;
  lastDraftData = [...hardcodedDraftData];

  xpressionLogger.info("🔄 Draft reset to hardcoded data");

  res.json({
    message: "✅ Draft reset to hardcoded data",
    data: lastDraftData,
  });
});

// GET route to start looping the hardcoded draft progressively
router.get("/draft/loop/start", (req, res) => {
  const interval = Number(req.query.interval || 1500);

  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }

  loopIndex = 0;
  lastDraftData = [];

  loopTimer = setInterval(() => {
    loopIndex += 1;

    if (loopIndex > hardcodedDraftData.length) {
      loopIndex = 1;
    }

    lastDraftData = hardcodedDraftData.slice(0, loopIndex);

    xpressionLogger.info("🔁 Looping draft update:", buildDraft(lastDraftData));
  }, interval);

  res.json({
    message: "🚀 Draft loop started",
    interval,
    totalSteps: hardcodedDraftData.length,
  });
});

// GET route to stop looping
router.get("/draft/loop/stop", (req, res) => {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }

  res.json({
    message: "🛑 Draft loop stopped",
    data: lastDraftData,
  });
});

module.exports = router;

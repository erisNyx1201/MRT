/***************************
 * Xpression Draft Routes
 *
 * Handles draft (ban/pick) data for Xpression.
 ***************************/
const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const Team = require("../models/Team");
const { xpressionLogger } = require("../modules/logger");

const heroesRaw = require("../../Client/src/assets/heroes_UO.json");
const mapsRaw = require("../../Client/src/assets/maps.json");

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

let lastDraftData = [];
let draftSourceData = [];
let currentStatsPayload = null;
let currentDraftMapMeta = null;
let loopTimer = null;
let loopIndex = 0;
let phaseStartedAt = null;
const PHASE_SECONDS = 20;

// Helper to format time as HH:mm:ss
function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
}

const heroMap = Object.fromEntries(
  heroesRaw.map((hero) => [String(hero.id), hero]),
);

const mapMap = Object.fromEntries(mapsRaw.map((map) => [String(map.id), map]));

function normalizeHeroName(name = "") {
  return String(name)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

function getHeroName(heroId) {
  let normalizedId = heroId;
  if (heroId === 10571 || heroId === 10572 || heroId === 10573) {
    normalizedId = 1057;
  }
  const hero = heroMap[Number(normalizedId)];
  return hero ? normalizeHeroName(hero.name) : `Hero ${heroId}`;
}
function getHeroRole(heroId) {
  let role = "Unknown";
  if (heroId === 10571 || heroId === 10572 || heroId === 10573) {
    const hero = heroMap[Number(1057)];
    if (heroId === 10571) role = hero?.role?.[0];
    else if (heroId === 10572) role = hero?.role?.[1];
    else if (heroId === 10573) role = hero?.role?.[2];
  } else {
    const hero = heroMap[Number(heroId)];
    role = hero?.role || "Unknown";
  }
  return `${role}`;
}

async function getSavedPlayerNameMap() {
  const teams = await Team.find({}).lean();

  const map = {};

  teams.forEach((team) => {
    (team.players || []).forEach((player) => {
      map[String(player.player_uid || player.uid)] =
        player.broadcast_name || player.name || player.nick_name;
    });
  });

  return map;
}

function getScore(scoreInfo, camp) {
  if (!scoreInfo) return 0;
  if (typeof scoreInfo.get === "function")
    return Number(scoreInfo.get(String(camp)) || 0);
  return Number(scoreInfo[String(camp)] || scoreInfo[camp] || 0);
}

function safeJsonParse(value, fallback = {}) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function buildPlayerPayload(player, playerNameMap = {}) {
  return {
    name:
      playerNameMap[player.player_uid] ||
      player.nick_name ||
      `Player ${String(player.player_uid)}`,
    uid: player.player_uid,

    hero: {
      name: getHeroName(player.cur_hero_id),
      id: player.cur_hero_id,
      role: getHeroRole(player.cur_hero_id),
    },

    kills: player.k || 0,
    deaths: player.d || 0,
    assists: player.a || 0,

    damage: player.total_damage || 0,
    damage_taken: player.total_damage_taken || 0,
    healing: player.total_heal || 0,

    hit_rate: player.session_hit_rate || 0,

    solo_kill: player.solo_kill || 0,

    last_kill: player.player_heroes?.[0]?.last_kill || 0,

    consecutiveKOs: player.consecutive_kos || 0,

    continueKillKDA: player.continue_kill_kda || 0,

    // hp: player.hp || 0,

    // ult_ratio: player.ult_ratio || 0,

    // abilities: player.abilities || {},

    // special_data: player.special_data || {},
  };
}

function buildXpressionPostMatch(match, playerNameMap = {}) {
  const scoreInfo = match.dynamic_fields?.score_info || {};

  const blueScore = getScore(scoreInfo, 1);
  const redScore = getScore(scoreInfo, 2);

  const mvpPlayer = match.match_players?.find(
    (p) => Number(p.player_uid) === Number(match.mvp_uid),
  );

  // const svpPlayer = match.match_players?.find(
  //   (p) => Number(p.player_uid) === Number(match.svp_uid),
  // );

  const mvpCamp = Number(mvpPlayer?.camp || 0);

  const blueWin = mvpCamp === 1 ? 1 : 0;
  const redWin = mvpCamp === 2 ? 1 : 0;

  const bluePlayers = match.match_players
    .filter((p) => Number(p.camp) === 1)
    .map((p) => buildPlayerPayload(p, playerNameMap));

  const redPlayers = match.match_players
    .filter((p) => Number(p.camp) === 2)
    .map((p) => buildPlayerPayload(p, playerNameMap));

  return {
    map_id: match.match_map_id,
    map_name:
      mapMap[String(match.match_map_id)]?.name || `Map ${match.match_map_id}`,
    map_mode:
      mapMap[String(match.match_map_id)]?.game_mode ||
      `Map ${match.match_map_id}`,

    Blue: {
      name: "Blue",
      short: "BLU",
      is_win: blueWin,
      score: blueScore,
      players: bluePlayers,
    },

    Red: {
      name: "Red",
      short: "RED",
      is_win: redWin,
      score: redScore,
      players: redPlayers,
    },

    MVP: mvpPlayer ? buildPlayerPayload(mvpPlayer, playerNameMap) : null,

    // SVP: svpPlayer ? buildPlayerPayload(svpPlayer, playerNameMap) : null,
  };
}

function getDraftTimer() {
  if (!phaseStartedAt) {
    return {
      phase_seconds: PHASE_SECONDS,
      remaining: PHASE_SECONDS,
    };
  }

  const elapsed = Math.floor((Date.now() - phaseStartedAt) / 1000);

  return {
    phase_seconds: PHASE_SECONDS,
    remaining: Math.max(PHASE_SECONDS - elapsed, 0),
  };
}

function buildDraft(data = [], { firstPickerPhase1 } = {}, isLive = false) {
  const plan = buildDraftPlan();
  const slotCounter = {
    1: 0,
    2: 0,
  };

  const Draft = data.map((item) => {
    slotCounter[item.camp] += 1;

    const slot =
      Number(item.camp) === 1
        ? `Blue ${slotCounter[item.camp]}`
        : `Red ${slotCounter[item.camp]}`;

    if (isLive) {
      return {
        round: Number(item.round_index),
        type: Number(item.operate_type) === 1 ? "PICK" : "BAN",
        camp: Number(item.camp),
        slot,
        hero: {
          id: item.cur_pick_hero ?? null,
          name: getHeroName(item.cur_pick_hero),
          role: getHeroRole(item.cur_pick_hero),
        },
      };
    } else {
      return {
        round: Number(item.round_index),
        type: Number(item.operate_type) === 1 ? "PICK" : "BAN",
        camp: Number(item.camp),
        slot,
        hero: {
          id: item.hero_id ?? null,
          name: getHeroName(item.hero_id),
          role: getHeroRole(item.hero_id),
        },
      };
    }
  });

  if (!Draft.length) {
    return {
      Map: currentDraftMapMeta || {},
      Timer: getDraftTimer(),
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
    Map: currentDraftMapMeta || {},
    Timer: getDraftTimer(),
    Draft,
    meta: {
      current_round: nextRoundMeta.round_index,
      phase: nextRoundMeta.phase,
      active_camp: nextRoundMeta.camp,
    },
  };
}

// Helper to build the full draft plan based on first picker in phase 1
function buildDraftPlan() {
  const first = 2;
  const second = 1;

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

// POST route to receive stats data
router.post("/stats", async (req, res) => {
  try {
    const { match_uid } = req.body;

    const match = await Match.findOne({ match_uid }).lean();

    currentDraftMapMeta = {
      id: match.match_map_id,

      name:
        mapMap[String(match.match_map_id)]?.name || `Map ${match.match_map_id}`,

      mode: mapMap[String(match.match_map_id)]?.game_mode || "",
    };

    const playerNameMap = await getSavedPlayerNameMap();

    currentStatsPayload = buildXpressionPostMatch(match, playerNameMap);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to build stats",
      detail: err.message,
    });
  }
});

// GET route to retrieve stats data
router.get("/stats", async (req, res) => {
  try {
    res.json(currentStatsPayload || {});
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to get stats",
    });
  }
});

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

// GET route to start looping the draft progressively
router.post("/draft/loop/start", async (req, res) => {
  try {
    loopIndex = 0;
    lastDraftData = [];
    phaseStartedAt = Date.now();

    const { match_uid, interval = 20000 } = req.body;

    const match = await Match.findOne({ match_uid }).lean();

    currentDraftMapMeta = {
      id: match.match_map_id,

      name:
        mapMap[String(match.match_map_id)]?.name || `Map ${match.match_map_id}`,

      mode: mapMap[String(match.match_map_id)]?.game_mode || "",
    };

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    draftSourceData = match.dynamic_fields?.ban_pick_info || [];

    if (!draftSourceData.length) {
      return res
        .status(400)
        .json({ error: "No ban/pick data found for this match" });
    }

    if (loopTimer) clearInterval(loopTimer);

    loopIndex = 0;
    lastDraftData = [];

    loopTimer = setInterval(() => {
      loopIndex += 1;

      if (loopIndex > draftSourceData.length) {
        loopIndex = 1;
      }

      lastDraftData = draftSourceData.slice(0, loopIndex);
      phaseStartedAt = Date.now();
    }, Number(interval));

    res.json({
      success: true,
      message: "Draft loop started",
      match_uid,
      interval: Number(interval),
      totalSteps: draftSourceData.length,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to start draft loop",
      detail: err.message,
    });
  }
});

// GET route to stop looping
router.post("/draft/loop/stop", (req, res) => {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }

  res.json({
    success: true,
    message: "Draft loop stopped",
    data: buildDraft(lastDraftData),
  });
});

module.exports = router;

const axios = require("axios");
const https = require("https");
const JSONBigInt = require("json-bigint")({ storeAsString: true });
const { apiLogger } = require("../modules/logger");

const MR_TOKEN = process.env.MR_TOKEN;

const insecureAgent = new https.Agent({
  rejectUnauthorized: false,
});

const ROOM_BASE = process.env.MR_GMPROXY_BASE;
const REPLAY_BASE = process.env.MR_REPLAY_BASE;

// console.log("MR_TOKEN:", MR_TOKEN ? "***" : "Not Set");
// console.log("ROOM_BASE:", ROOM_BASE);
// console.log("REPLAY_BASE:", REPLAY_BASE);

async function getRoomList() {
  try {
    const response = await axios.get(`${ROOM_BASE}/room_list`, {
      responseType: "text",
      transformResponse: [(data) => data], // Prevent axios from parsing JSON
      headers: {
        Authorization: `Basic ${MR_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return JSONBigInt.parse(JSON.stringify(response.data));
  } catch (error) {
    console.error(":x: Marvel API ERROR:", {
      url: `${ROOM_BASE}/room_list`,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw error;
  }
}

async function getRealtimeBanPick(roomId) {
  try {
    const response = await axios.get(`${ROOM_BASE}/realtime_ban_pick`, {
      headers: {
        Authorization: `Basic ${MR_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      params: { room_id: roomId },
    });
    return response.data;
  } catch (error) {
    console.error(":x: Marvel API ERROR:", {
      url: `${ROOM_BASE}/realtime_ban_pick?room_id=${roomId}`,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw error;
  }
}

async function getBattleStatistics(roomId) {
  try {
    const response = await axios.get(`${ROOM_BASE}/battle_statistics`, {
      headers: {
        Authorization: `Basic ${MR_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      params: { room_id: roomId },
    });
    return response.data;
  } catch (error) {
    console.error(":x: Marvel API ERROR:", {
      url: `${ROOM_BASE}/battle_statistics?room_id=${roomId}`,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw error;
  }
}

async function getReplayQueryMatch(body) {
    try {
    const response = await axios.post(`${REPLAY_BASE}`, {
      headers: {
        Authorization: `Basic ${MR_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: {
        replay_ids: body?.replay_ids || ['50114224938'],
      },
    });
    return response.data;
  } catch (error) {
    console.error(":x: Marvel API ERROR:", {
      url: `${ROOM_BASE}/replay_query_match`,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw error;
  }
}

module.exports = {
  getRoomList,
  getRealtimeBanPick,
  getBattleStatistics,
  getReplayQueryMatch,
};

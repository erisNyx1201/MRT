const axios = require("axios");
const https = require("https");
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

// old version with detailed logging
// async function fetchMarvelAPI({
//   baseURL,
//   endpoint,
//   method = 'GET',
//   params = {},
//   data = {}
// }) {
//   try {
//     const response = await axios({
//       method,
//       baseURL,
//       url: endpoint,
//       params,
//       data,
//       timeout: 15000,
//       headers: {
//         Authorization: `Basic ${process.env.MR_TOKEN}`,
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//         'User-Agent': 'Mozilla/5.0' // :fire: important fix
//       }
//     })

//     return response.data

//   } catch (error) {
//     console.error(':x: Marvel API ERROR:')
//     console.error('URL:', `${baseURL}${endpoint}`)
//     console.error('STATUS:', error.response?.status)
//     console.error('DATA:', error.response?.data)
//     console.error('MESSAGE:', error.message)

//     throw error
//   }
// }
//old version without detailed logging
// async function fetchMarvelAPI({
//   baseURL,
//   endpoint,
//   method = 'GET',
//   params = {},
//   data = {},
// }) {
//   try {
//     const response = await axios({
//       method,
//       baseURL,
//       url: endpoint,
//       params,
//       data,
//       timeout: 15000,
//       // httpsAgent: endpoint.includes('replay_query_match') ? insecureAgent : undefined,
//       headers: {
//         Authorization: `Basic ${MR_TOKEN}`,
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     });

//     apiLogger.info(`Marvel API fetched: ${endpoint}`);
//     return response.data;
//   } catch (error) {
//     apiLogger.error(
//       `Marvel API error ${endpoint}: ${error.response?.status || ''} ${error.message}`
//     );
//     throw error;
//   }
// }

// const https = require('https')

//400
// async function fetchMarvelAPI({
//   baseURL,
//   endpoint,
//   method = 'GET',
//   params = {},
//   data = {}
// }) {
//   try {
//     const response = await axios({
//       method,
//       baseURL,
//       url: endpoint,
//       params,
//       data,
//       timeout: 15000,
//       // httpsAgent: new https.Agent({
//       //   rejectUnauthorized: false
//       // }),
//       headers: {
//         Authorization: `Basic ${process.env.MR_TOKEN}`,
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//         'User-Agent': 'Mozilla/5.0'
//       }
//     })

//     return response.data
//   } catch (error) {
//     console.error(':x: Marvel API ERROR:', {
//       url: `${baseURL}${endpoint}`,
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     })

//     throw error
//   }
// }

async function fetchMarvelAPI({
  baseURL,
  endpoint,
  method = "GET",
  params = {},
  data = {},
}) {
  try {
    const response = await axios({
      method,
      baseURL,
      url: endpoint,
      params,
      data,
      timeout: 15000,
      headers: {
        Authorization: `Basic ${MR_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(":x: Marvel API ERROR:", {
      url: `${baseURL}${endpoint}`,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw error;
  }
}

async function getRoomList() {
  try {
    const response = await axios.get(`${ROOM_BASE}/room_list`, {
      headers: {
        Authorization: `Basic ${MR_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.data;
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
  // return fetchMarvelAPI({
  //   baseURL: REPLAY_BASE,
  //   endpoint: "/replay_query_match",
  //   method: "POST",
  //   data: body || {},
  // });
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

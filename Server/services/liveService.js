const axios = require('axios');
const https = require('https');
const { apiLogger } = require('../modules/logger');

const MR_TOKEN = process.env.MR_TOKEN;

const insecureAgent = new https.Agent({
  rejectUnauthorized: false,
});

const ROOM_BASE = process.env.MR_GMPROXY_BASE;
const REPLAY_BASE = process.env.MR_REPLAY_BASE;

async function fetchMarvelAPI({
  baseURL,
  endpoint,
  method = 'GET',
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
      httpsAgent: endpoint.includes('replay_query_match') ? insecureAgent : undefined,
      headers: {
        Authorization: `Basic ${MR_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    apiLogger.info(`Marvel API fetched: ${endpoint}`);
    return response.data;
  } catch (error) {
    apiLogger.error(
      `Marvel API error ${endpoint}: ${error.response?.status || ''} ${error.message}`
    );
    throw error;
  }
}

async function getRoomList() {
  return fetchMarvelAPI({
    baseURL: ROOM_BASE,
    endpoint: '/room_list',
    method: 'GET',
  });
}

async function getRealtimeBanPick(roomId) {
  return fetchMarvelAPI({
    baseURL: ROOM_BASE,
    endpoint: '/realtime_ban_pick',
    method: 'GET',
    params: { room_id: roomId },
  });
}

async function getBattleStatistics(roomId) {
  return fetchMarvelAPI({
    baseURL: ROOM_BASE,
    endpoint: '/battle_statistics',
    method: 'GET',
    params: { room_id: roomId },
  });
}

async function getReplayQueryMatch(body) {
  return fetchMarvelAPI({
    baseURL: REPLAY_BASE,
    endpoint: '/replay_query_match',
    method: 'POST',
    data: body || {},
  });
}

module.exports = {
  getRoomList,
  getRealtimeBanPick,
  getBattleStatistics,
  getReplayQueryMatch,
};
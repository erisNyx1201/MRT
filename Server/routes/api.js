/********************************
 * API Routes
 *
 * This module defines the API routes for the server, including
 * interactions with the Marvel Rivals API.
 ********************************/

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { apiLogger, responseLogger } = require("../modules/logger");

const MR_API_KEY = process.env.MR_API_KEY;
const MR_TOKEN = process.env.MR_TOKEN;
const MR_GMPROXY_BASE = process.env.MR_GMPROXY_BASE;
const MR_REPLAY_BASE = process.env.MR_REPLAY_BASE;

//#region Unofficial Marvel Rivals API Routes
const fetchMRAPI = async (endpoint) => {
  try {
    const response = await axios.get(
      `https://api.marvelrivals.com/api/${endpoint}`,
      {
        headers: {
          "x-api-key": MR_API_KEY,
          Accept: "application/json",
        },
      },
    );

    apiLogger.warn("[DATE] : ", response.headers.date);
    return response.data;
  } catch (error) {
    apiLogger.error(
      `Error fetching Marvel API: ${endpoint} - ${error.message}`,
    );
    throw error;
  }
};

// Heroes route from API
router.get("/heroes", async (req, res) => {
  apiLogger.warn(`Fetching data for heroes`);

  try {
    const data = await fetchMRAPI(`/v1/heroes`);
    apiLogger.info(`Heroes data fetched successfully`);
    responseLogger.info(`Heroes API fetched: ${JSON.stringify(data)}`);
    res.json(data);
  } catch (error) {
    apiLogger.error(
      `Failed to fetch heroes from the API: ${
        error.response?.status || error.message
      })`,
    );
    res
      .status(500)
      .json({ error: error.response?.data || "Error fetching heroes" });
  }
});

// Maps route from API
router.get("/maps", async (req, res) => {
  apiLogger.warn(`Fetching data for maps`);

  try {
    const data = await fetchMRAPI(`/v1/maps`);
    apiLogger.info(`Maps data fetched successfully`);
    responseLogger.info(`Maps API fetched: ${JSON.stringify(data.total_maps)}`);
    res.json(data.maps);
  } catch (error) {
    apiLogger.error(
      `Failed to fetch maps from the API: ${
        error.response?.status || error.message
      })`,
    );
    res
      .status(500)
      .json({ error: error.response?.data || "Error fetching maps" });
  }
});

// Player route from API
router.get("/player/:uid", async (req, res) => {
  const playerId = req.params.uid;
  apiLogger.warn(`Fetching data for player ID: ${playerId}`);

  try {
    const data = await fetchMRAPI(`/v1/player/${playerId}`);
    apiLogger.info(`Player data fetched successfully for ID: ${playerId}`);
    responseLogger.info(
      `Player API fetched for ID ${playerId}: ${JSON.stringify(data)}`,
    );
    res.json(data);
  } catch (error) {
    apiLogger.error(
      `Failed to fetch player from the API for ID ${playerId}: ${
        error.response?.status || error.message
      })`,
    );
    res
      .status(500)
      .json({ error: error.response?.data || "Error fetching player" });
  }
});
//#endregion

//#region Official Marvel Rivals API Routes
const fetchMarvelAPI = async ({
  baseURL,
  endpoint,
  method = "GET",
  params = {},
  data = {},
}) => {
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

    apiLogger.warn(`[DATE] : ${response.headers.date || "N/A"}`);
    return response.data;
  } catch (error) {
    apiLogger.error(
      `Error fetching MR Official API: ${endpoint} - ${error.response?.status || ""} ${error.message}`,
    );
    throw error;
  }
};

/**
 * GET /api/mr/room-list
 * Proxy:
 * http://paycompetition.x20na.easebar.com/gmproxy/12001/room_list
 */
router.get("/mr/room-list", async (req, res) => {
  apiLogger.warn("Fetching data for room_list");

  try {
    const data = await fetchMarvelAPI({
      baseURL: MR_GMPROXY_BASE,
      endpoint: "/room_list",
    });

    apiLogger.info("room_list fetched successfully");
    responseLogger.info(`room_list API fetched: ${JSON.stringify(data)}`);
    res.json(data);
  } catch (error) {
    apiLogger.error(
      `Failed to fetch room_list: ${error.response?.status || error.message}`,
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Error fetching room_list",
    });
  }
});

/**
 * GET /api/mr/realtime-ban-pick/:roomID
 * Proxy:
 * http://paycompetition.x20na.easebar.com/gmproxy/12001/realtime_ban_pick?room_id={roomID}
 */
router.get("/mr/realtime-ban-pick/:roomID", async (req, res) => {
  const { roomID } = req.params;
  apiLogger.warn(`Fetching realtime_ban_pick for room_id=${roomID}`);

  try {
    const data = await fetchMarvelAPI({
      baseURL: MR_GMPROXY_BASE,
      endpoint: "/realtime_ban_pick",
      params: { room_id: roomID },
    });

    apiLogger.info(
      `realtime_ban_pick fetched successfully for room_id=${roomID}`,
    );
    responseLogger.info(
      `realtime_ban_pick API fetched: ${JSON.stringify(data)}`,
    );
    res.json(data);
  } catch (error) {
    apiLogger.error(
      `Failed to fetch realtime_ban_pick for room_id=${roomID}: ${error.response?.status || error.message}`,
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Error fetching realtime_ban_pick",
    });
  }
});

/**
 * GET /api/mr/battle-statistics/:roomID
 * Proxy:
 * http://paycompetition.x20na.easebar.com/gmproxy/12001/battle_statistics?room_id={roomID}
 */
router.get("/mr/battle-statistics/:roomID", async (req, res) => {
  const { roomID } = req.params;
  apiLogger.warn(`Fetching battle_statistics for room_id=${roomID}`);

  try {
    const data = await fetchMarvelAPI({
      baseURL: MR_GMPROXY_BASE,
      endpoint: "/battle_statistics",
      params: { room_id: roomID },
    });

    apiLogger.info(
      `battle_statistics fetched successfully for room_id=${roomID}`,
    );
    responseLogger.info(
      `battle_statistics API fetched: ${JSON.stringify(data)}`,
    );
    res.json(data);
  } catch (error) {
    apiLogger.error(
      `Failed to fetch battle_statistics for room_id=${roomID}: ${error.response?.status || error.message}`,
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Error fetching battle_statistics",
    });
  }
});

/**
 * POST /api/mr/replay-query-match
 * Proxy:
 * https://sm-x20-24zaflzc-prod-out.nie.easebar.com:12003/xyq_service/admin/xyq-career/replay_query_match
 *
 * This endpoint is safer as POST because these kinds of admin/replay endpoints
 * usually expect a JSON body.
 *
 * Example body:
 * {
 *   "match_uid": "4853284_1759664945_1267004_12001_31"
 * }
 */
router.post("/mr/replay-query-match", async (req, res) => {
  apiLogger.warn("Fetching replay_query_match");

  try {
    const data = await fetchMarvelAPI({
      baseURL: MR_REPLAY_BASE,
      endpoint: "/replay_query_match",
      method: "POST",
      data: req.body || {},
    });

    apiLogger.info("replay_query_match fetched successfully");

    // extract only first match
    const match = data?.data?.matches?.[0] || null;

    responseLogger.info(`Match extracted: ${JSON.stringify(match)}`);

    res.json(match);
  } catch (error) {
    console.error("replay_query_match error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    res.status(error.response?.status || 500).json({
      error:
        error.response?.data ||
        error.message ||
        "Error fetching replay_query_match",
    });

    // apiLogger.error(
    //   `Failed to fetch replay_query_match: ${error.response?.status || error.message}`
    // );
    // res.status(error.response?.status || 500).json({
    //   error: error.response?.data || "Error fetching replay_query_match",
    // });
  }
});
//#endregion

module.exports = router;

// function normalizeMatchPayload(payload) {
//   return {
//     ...payload,
//     dynamic_fields: payload.dynamic_fields || {},
//     match_players: Array.isArray(payload.match_players)
//       ? payload.match_players.map((player) => ({
//           ...player,
//           dynamic_fields: player.dynamic_fields || {},
//           badge_ids: Array.isArray(player.badge_ids) ? player.badge_ids : null,
//           player_heroes: Array.isArray(player.player_heroes)
//             ? player.player_heroes.map((hero) => ({
//                 ...hero,
//                 add_dynamic_fields:
//                   hero.add_dynamic_fields === undefined ? null : hero.add_dynamic_fields,
//               }))
//             : [],
//         }))
//       : [],
//   };
// }

const mongoose = require('mongoose');

const { Schema } = mongoose;

const BadgeSchema = new Schema(
  {
    id: { type: Number, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const BanPickInfoSchema = new Schema(
  {
    vote_type: { type: Number, default: 0 },
    effect_battle_side: { type: Number, default: 0 },
    hero_id: { type: Number, required: true },
    battle_side: { type: Number, default: 0 },
    is_pick: { type: Number, default: 0 },
    round_idx: { type: Number, required: true },
    is_one_side: { type: Boolean, default: true },
    conf_id: { type: Number, default: 0 },
    votes: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const RankScoreInfoSchema = new Schema(
  {
    Power: Number,
    mu: Number,
    score_id: Number,
    sigma: Number,
    elo_score: Number,
    protect_score: Number,
    max_continue_win_count: Number,
    login_os: Number,
    battle_win_count: Number,
    level: Number,
    all_battle_count: Number,
    battle_count: Number,
    protect_item_count: Number,
    warm_score: Number,
    score: Number,
  },
  { _id: false }
);

const PlayerDynamicFieldsSchema = new Schema(
  {
    hero_head_icon: { type: Schema.Types.Mixed, default: {} },
    login_os: Number,
    local_host_name: String,
    rankscore_info: { type: RankScoreInfoSchema, default: undefined },
    show_name: Boolean,
    ai_special: { type: Schema.Types.Mixed, default: {} },
    epic_moments: { type: String, default: '[]' },
  },
  {
    _id: false,
    strict: false,
  }
);

const PlayerHeroSchema = new Schema(
  {
    hero_id: { type: Number, required: true },
    hero_skin: { type: Number, default: 0 },
    play_time: { type: Number, default: 0 },

    k: { type: Number, default: 0 },
    d: { type: Number, default: 0 },
    a: { type: Number, default: 0 },

    total_damage: { type: Number, default: 0 },
    total_hero_damage: { type: Number, default: 0 },
    total_heal: { type: Number, default: 0 },
    total_hero_heal: { type: Number, default: 0 },
    total_damage_taken: { type: Number, default: 0 },
    total_hero_damage_taken: { type: Number, default: 0 },

    last_kill: { type: Number, default: 0 },
    head_kill: { type: Number, default: 0 },
    solo_kill: { type: Number, default: 0 },

    main_attack_cnt: { type: Number, default: 0 },
    main_attack_hit: { type: Number, default: 0 },
    shield_hit_cnt: { type: Number, default: 0 },
    summoner_hit_cnt: { type: Number, default: 0 },
    chaos_hit_cnt: { type: Number, default: 0 },

    session_hit_rate: { type: Number, default: 0 },
    session_continue_kill_count: { type: Number, default: 0 },
    session_survival_kill_count: { type: Number, default: 0 },

    continue_kill_3_count: { type: Number, default: 0 },
    continue_kill_4_count: { type: Number, default: 0 },
    continue_kill_5_count: { type: Number, default: 0 },
    continue_kill_6_count: { type: Number, default: 0 },

    replays: { type: Schema.Types.Mixed, default: null },
    add_dynamic_fields: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const MatchPlayerSchema = new Schema(
  {
    player_uid: { type: Number, required: true },
    skip_aggr: { type: Boolean, default: false },
    is_ai: { type: Number, default: 0 },
    zone_id: Number,
    device_type: String,
    nick_name: String,
    player_icon: Number,
    player_icon_bg: Number,
    camp: Number,
    has_escaped: Boolean,
    player_level: Number,
    upvote_exp: Number,
    play_time: { type: Number, default: 0 },
    cur_hero_id: Number,
    max_continue_win_count: { type: Number, default: 0 },
    is_win: { type: Number, default: 0 },
    is_online: { type: Number, default: 0 },

    k: { type: Number, default: 0 },
    d: { type: Number, default: 0 },
    a: { type: Number, default: 0 },

    total_damage: { type: Number, default: 0 },
    total_hero_damage: { type: Number, default: 0 },
    total_heal: { type: Number, default: 0 },
    total_hero_heal: { type: Number, default: 0 },
    total_damage_taken: { type: Number, default: 0 },
    total_hero_damage_taken: { type: Number, default: 0 },

    last_kill: { type: Number, default: 0 },
    head_kill: { type: Number, default: 0 },
    solo_kill: { type: Number, default: 0 },

    main_attack_cnt: { type: Number, default: 0 },
    main_attack_hit: { type: Number, default: 0 },
    shield_hit_cnt: { type: Number, default: 0 },
    summoner_hit_cnt: { type: Number, default: 0 },
    chaos_hit_cnt: { type: Number, default: 0 },

    max_continue_kill_count: { type: Number, default: 0 },
    max_survival_kill_count: { type: Number, default: 0 },
    session_hit_rate: { type: Number, default: 0 },

    continue_kill_3_count: { type: Number, default: 0 },
    continue_kill_4_count: { type: Number, default: 0 },
    continue_kill_5_count: { type: Number, default: 0 },
    continue_kill_6_count: { type: Number, default: 0 },

    damage_score: { type: Number, default: 0 },
    damage_mask: { type: Number, default: 0 },
    defense_score: { type: Number, default: 0 },
    defense_mask: { type: Number, default: 0 },
    assist_score: { type: Number, default: 0 },
    assist_mask: { type: Number, default: 0 },
    kda_score: { type: Number, default: 0 },
    kda_mask: { type: Number, default: 0 },
    hit_score: { type: Number, default: 0 },
    hit_mask: { type: Number, default: 0 },

    dynamic_fields: {
      type: PlayerDynamicFieldsSchema,
      default: () => ({}),
    },

    // allow null because your current stored docs sometimes have null here
    badge_ids: {
      type: [BadgeSchema],
      default: undefined,
    },

    player_heroes: {
      type: [PlayerHeroSchema],
      default: [],
    },
  },
  { _id: false }
);

const MatchDynamicFieldsSchema = new Schema(
  {
    ban_pick_info: { type: [BanPickInfoSchema], default: [] },
    mode_id: Number,
    battle_id: String,
    replay_version: String,

    // kept as string because your stored data uses a JSON string
    league_round_info: { type: String, default: '' },

    replay_session_name: String,
    battle_replay_revision: Number,
    game_play_mode_id: Number,

    score_info: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    _id: false,
    strict: false,
  }
);

const MatchSchema = new Schema(
  {
    match_uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    match_time_stamp: {
      type: Number,
      index: true,
    },
    match_map_id: Number,
    match_winner_side: Number,
    game_mode_id: Number,
    match_season: String,
    play_mode_id: Number,
    zone_id: Number,

    replay_id: String,
    replay_hide: Boolean,
    match_play_duration: Number,

    mvp_uid: Number,
    mvp_hero_id: Number,
    svp_uid: Number,
    svp_hero_id: Number,

    max_damage_token_uid: Number,
    max_assists_uid: Number,
    max_hero_damage_uid: Number,
    max_gold_obtain_uid: Number,
    max_kill_uid: Number,
    max_heal_uid: Number,

    dynamic_fields: {
      type: MatchDynamicFieldsSchema,
      default: () => ({}),
    },

    is_polymeric: { type: Number, default: 0 },

    match_players: {
      type: [MatchPlayerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: false,
    versionKey: false,
  }
);

// helpful indexes
// MatchSchema.index({ match_uid: 1 }, { unique: true });
MatchSchema.index({ match_time_stamp: -1 });
MatchSchema.index({ match_map_id: 1 });
MatchSchema.index({ game_mode_id: 1 });
MatchSchema.index({ 'match_players.player_uid': 1 });

module.exports = mongoose.model('Match', MatchSchema);
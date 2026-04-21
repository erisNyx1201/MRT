/*******************************
 * Team Model - Defines the schema for Team data in MongoDB
 * 
 * Fields include team details, player list, and associated clan information.
 *******************************/

const mongoose = require('mongoose');

const teamPlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uid: { type: String, required: true},
  flag: { type: String }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true, index: true },
  type: { type: Number },
  active: { type: Boolean, default: false },
  players: [teamPlayerSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);

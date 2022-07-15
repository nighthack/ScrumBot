const { Schema, model } = require("mongoose");

const standupSchema = new Schema({
  _id: String,
  channelId: String,
  members: [String],
  responses: {
    type: Map,
    of: String,
  },
});

standupSchema.methods.checkFulfilled = function (callback) {
  const missing = [];

  this.members.forEach((member) => {
    if (!this.responses.get(member)) {
      missing.push(member);
    }
  });
  callback(missing);
};

module.exports = model("Standup", standupSchema);

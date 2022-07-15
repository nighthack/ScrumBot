const scrumModel = require("../model/model");

module.exports = {
  name: "list",
  guildOnly: true,
  description: "List of all members participating in the scrum",
  execute(message, args) {
    scrumModel.findById(message.guild.id).then(scrum => {
      let res = "List of all memebers in the scrum:\n";
      if(!scrum.members.length) {
        message.reply("No members")
      } else {
        scrum.members.forEach(member => {
          res += `<@${member}>\t`;
        });
        message.channel.send(res);
      }
    }).catch(err => {
      console.error(err);
      message.channel.send(
        "ERROR!"
      );
    })
  },
};

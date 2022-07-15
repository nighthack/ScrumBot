const scrumModel = require("../model/model");

module.exports = {
  name: "reset",
  guildOnly: true,
  description: "Resets the scrum",
  async execute(message, args) {
    // Check if user has perms
    if (!message.member.hasPermission("MANAGE_GUILD")) {
      return message.reply("You do not have the required permission!");
    }

    let check = true;
    scrumModel.findById(message.guild.id).then(scrum => {
      scrum.members.forEach(id => {if(scrum.responses.has(id)) {scrum.responses.delete(id);}});
      scrum.members = [];
      scrum.save().then(() => message.channel.send("\nStandup successfully reset! :tada:\n*There are no memebers in the scrum, and all responses have been cleared!*")).catch(err => {
        console.error(err);
        message.channel.send("ERROR");
      })
    }).catch(err => {
      console.error(err);
      message.channel.send("ERROR!");
    })
  },
};

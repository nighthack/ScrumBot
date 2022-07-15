const scrumModel = require("../model/model");

module.exports = {
  name: "view",
  usage: "@<optional_serverId>",
  description: "View your scrum response",
  execute(message, args) {
    if (message.channel.type === "dm") {
      if (args.length == 1 && !args[0].startsWith("@")) {
        return message.reply(
          "Invalid."
        );
      } else if (args.length && args[0].startsWith("@")) {
        scrumModel
          .findById(args[0].slice(1))
          .then((scrum) => {
            if (scrum.members.indexOf(message.author.id) !== -1) {
              if (scrum.responses.has(message.author.id)) {
                message.reply(
                  "Here is your response:\n" +
                    scrum.responses.get(message.author.id)
                );
              } else {
                message.reply(
                  "..."
                );
              }
            } else {
              message.channel.send(
                "You must be a team member in this server scrum!"
              );
            }
          })
          .catch((err) => {
            console.error(err);
            message.channel.send(
              "ERROR"
            );
          });
      } else {
        scrumModel
          .find()
          .then((scrums) => {
            const userStandupList = scrums.filter(
              (scrum) => scrum.members.indexOf(message.author.id) !== -1
            );

            if (!userStandupList.length) {
              message.channel.send(
                "Must be a team member in atleast one server scrum!"
              );
            } else if (userStandupList.length > 1) {
              message.channel.send(
                "...."
              );
            } else {
              let [scrum] = userStandupList;
              if (scrum.responses.has(message.author.id)) {
                message.reply(
                  "Here is your response:\n" +
                    scrum.responses.get(message.author.id)
                );
              } else {
                message.reply(
                  "...."
                );
              }
            }
          })
          .catch((err) => {
            console.error(err);
            message.channel.send(
              "ERROR!"
            );
          });
      }
    } else {
      return message.reply("private DM me with `!view` :bomb:");
    }
  },
};

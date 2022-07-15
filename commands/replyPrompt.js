const scrumModel = require("../model/model");

module.exports = {
  name: "reply",
  usage: "@<optional_serverId> [your-message-here]",
  description: "Reply to scrum prompt",
  execute(message, args) {
    if (message.channel.type === "dm") {
      if (!args.length || (args.length == 1 && args[0].startsWith("@")))
        return message.reply(
          "Provide response message as argument"
        );

      if (args[0].startsWith("@")) {
        scrumModel
          .findById(args[0].slice(1))
          .then((scrum) => {
            if (scrum.members.indexOf(message.author.id) !== -1) {
              scrum.responses.set(
                message.author.id,
                args.splice(1).join(" ")
              );

              scrum
                .save()
                .then(() => message.channel.send("Updated Response :tada:"))
                .catch((err) => {
                  console.error(err);
                  message.channel.send(
                    "ERROR!"
                  );
                });
            } else {
              message.channel.send(
                "You must be a team member in this server scrum to reply to the response!"
              );
            }
          })
          .catch((err) => {
            console.error(err);
            message.channel.send(
              "ERROR!"
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
                "You must be a team member in any server scrum to reply to the response!"
              );
            } else if (userStandupList.length > 1) {
              message.channel.send(
                ""
              );
            } else {
              let [scrum] = userStandupList;
              scrum.responses.set(
                message.author.id,
                args.join(" ")
              );
              scrum
                .save()
                .then(() => message.channel.send("Updated Response"))
                .catch((err) => {
                  console.error(err);
                  message.channel.send(
                    "ERROR"
                  );
                });
            }
          })
          .catch((err) => {
            console.error(err);
            message.channel.send(
              "ERROR"
            );
          });
      }
    } else {
      return message.reply("private DM me with `!reply` :bomb:");
    }
  },
};

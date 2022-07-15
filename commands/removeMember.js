const standupModel = require("../model/model");

module.exports = {
  name: "rm",
  usage: "@<user> @<optional_user> ...",
  guildOnly: true,
  description: "Removes a member from the standup",
  async execute(message, args) {
    if (!args.length)
      return message.channel.send(
        "You need to mention at least one member as argument!"
      );

    standupModel
      .findById(message.guild.id)
      .then((standup) => {
        args.forEach((mention) => {
          if (mention.startsWith("<@") && mention.endsWith(">")) {
            mention = mention.slice(2, -1);

            if (mention.startsWith("!")) mention = mention.slice(1);

            const member = message.guild.members.cache.get(mention);

            if (member && standup.members.indexOf(member.id) != -1)
              standup.members = standup.members.filter(
                (id) => id !== member.id
              );
          }
        });

        standup
          .save()
          .then(() => message.channel.send("Members updated.."))
          .catch((err) => {
            console.err(err);
            message.channel.send(
              "ERROR"
            );
          });
      })
      .catch((err) => {
        console.error(err);
        message.channel.send(
          "ERROR"
        );
      });
  },
};

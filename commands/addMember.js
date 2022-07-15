const scrumModel = require("../model/model");

module.exports = {
  name: "am",
  usage: "@<user> @<optional_user> ...",
  guildOnly: false,
  description: "Adds a new member to the scrum",
  async execute(message, args) {
    if (!args.length)
      return message.channel.send(
        "You need to mention at least one member as argument!"
      );

    scrumModel
      .findById(message.guild.id)
      .then((scrum) => {
        args.forEach((mention) => {
          if (mention.startsWith("<@") && mention.endsWith(">")) {
            mention = mention.slice(2, -1);

            if (mention.startsWith("!")) mention = mention.slice(1);

            const member = message.guild.members.cache.get(mention);

            if (member && scrum.members.indexOf(member.id) == -1)
              scrum.members.push(member.id);
          }
        });

        scrum
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

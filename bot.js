"use strict"; // since I hate not using semicolons

require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const { Client, MessageEmbed, Collection } = require("discord.js");
const schedule = require("node-schedule");
const scrumModel = require("./model/model");

const PREFIX = "!";

const scrumIntroMessage = new MessageEmbed()
  .setTitle("Daily Scrum")
  .setDescription(
    "Channel for Scrums!"
  )
  .addFields(
    {
      name: "Introduction",
      value: "Reply from bot",
    },
    {
      name: "How's your work going?",
      value: "..........",
    },
    {
      name: "Are there any blockers pending on your end?",
      value: ".....",
    }
  )
  .setTimestamp();

  
const commandsDirPath = `${__dirname}/commands`

const dailyStandupSummary = new MessageEmbed()
  .setColor("#ff9900")
  .setTitle("Daily Standup")
  .setTimestamp();

// lists .js files in commands dir
const commandFiles = fs
  .readdirSync(commandsDirPath)
  .filter((file) => file.endsWith(".js"));

// init bot client with a collection of commands
const bot = new Client();
bot.commands = new Collection();

// Imports the command file + adds the command to the bot commands collection
for (const file of commandFiles) {
  const command = require(`${commandsDirPath}/${file}`);
  bot.commands.set(command.name, command);
}

// mongodb setup with mongoose
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .catch((e) => console.error(e));

mongoose.connection.once("open", () => console.log("mongoDB connected"));

bot.once("ready", () => console.log("Discord Bot Ready"));

// when a user enters a command
bot.on("message", async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!bot.commands.has(commandName)) return;

  if (message.mentions.users.has(bot.user.id))
    return message.channel.send(":robot:");

  const command = bot.commands.get(commandName);

  if (command.guildOnly && message.channel.type === "dm") {
    return message.channel.send("!@!");
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.channel.send(`Something went wrong!`);
  }
});

bot.on("guildCreate", async (guild) => {
  // creates the text channel
  const channel = await guild.channels.create("daily-scrums", {
    type: "text",
    topic: "Scrum Standup Meeting Channel",
  });

  // creates the database model
  const newStandup = new scrumModel({
    _id: guild.id,
    channelId: channel.id,
    members: [],
    responses: new Map(),
  });

  newStandup
    .save()
    .then(() => console.log("Great!"))
    .catch((err) => console.error(err));

  await channel.send(scrumIntroMessage);
});

// delete the mongodb entry
bot.on("guildDelete", (guild) => {
  scrumModel
    .findByIdAndDelete(guild.id)
    .then(() => console.log("Adios!"))
    .catch((err) => console.error(err));
});

let cron = schedule.scheduleJob(
  { hour: 15, minute: 30, dayOfWeek: new schedule.Range(1, 5) },
  (time) => {
    console.log(`[${time}] - CRON JOB START`);
    scrumModel
      .find()
      .then((scrums) => {
        scrums.forEach((scrum) => {
          let memberResponses = [];
          let missingMembers = [];
          scrum.members.forEach((id) => {
            if (scrum.responses.has(id)) {
              memberResponses.push({
                name: `-`,
                value: `<@${id}>\n${scrum.responses.get(id)}`,
              });
              scrum.responses.delete(id);
            } else {
              missingMembers.push(id);
            }
          });
          let missingString = "Hooligans: ";
          if (!missingMembers.length) missingString += ":man_shrugging:";
          else missingMembers.forEach((id) => (missingString += `<@${id}> `));
          bot.channels.cache
            .get(scrum.channelId)
            .send(
              new MessageEmbed(dailyStandupSummary)
                .setDescription(missingString)
                .addFields(memberResponses)
            );
          scrum
            .save()
            .then(() =>
              console.log(`[${new Date()}] - ${scrum._id} RESPONSES CLEARED`)
            )
            .catch((err) => console.error(err));
        });
      })
      .catch((err) => console.error(err));
  }
);

bot.login(process.env.DISCORD_TOKEN);

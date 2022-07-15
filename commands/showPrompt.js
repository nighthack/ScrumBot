module.exports = {
  name: "show",
  description: "Shows scrum prompt",
  async execute(message, args) {
    message.channel.send(`
Here is the daily scrum prompt:
\`\`\`
1. What has been done since yesterday?
2. What has been planed for today?
3. Any impediments or stumbling blockers?
\`\`\` DM me with \`!reply ...\` where \`...\` represents your response.`);
  },
};

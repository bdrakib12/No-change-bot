module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const logger = require("../../utils/log.js");

  return async function ({ event }) {
    const { allowInbox } = global.config;
    const { userBanned, threadBanned } = global.data;
    const { commands, eventRegistered } = global.client;

    let { senderID, threadID } = event;
    senderID = String(senderID);
    threadID = String(threadID);

    // নিষিদ্ধ user/thread স্কিপ করো
    if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox === false && senderID === threadID)) return;

    for (const eventReg of eventRegistered) {
      const cmd = commands.get(eventReg);
      if (!cmd || typeof cmd.handleEvent !== "function") continue;

      let getText2 = () => '';
      if (cmd.languages && typeof cmd.languages === 'object') {
        getText2 = (...values) => {
          const commandModule = cmd.languages || {};
          if (!commandModule.hasOwnProperty(global.config.language)) {
            return api.sendMessage(
              global.getText('handleCommand', 'notFoundLanguage', cmd.config.name),
              threadID,
              event.messageID
            );
          }
          let lang = cmd.languages[global.config.language][values[0]] || '';
          for (let i = values.length - 1; i >= 0; i--) {
            const expReg = RegExp('%' + (i + 1), 'g');
            lang = lang.replace(expReg, values[i]);
          }
          return lang;
        };
      }

      try {
        const Obj = { event, api, models, Users, Threads, Currencies, getText: getText2 };
        await cmd.handleEvent(Obj);
      } catch (error) {
        logger(`${global.getText('handleCommandEvent', 'moduleError', cmd?.config?.name || 'Unknown')} | ${error.message}`, 'error');
      }
    }
  };
};

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js"); // ✅ logger added

    const createGetText2 = (handleNeedExec, threadID, messageID, api) => {
        if (handleNeedExec.languages && typeof handleNeedExec.languages === 'object') {
            return (...value) => {
                const languageModule = handleNeedExec.languages || {};
                if (!languageModule.hasOwnProperty(global.config.language)) {
                    if (threadID && messageID)
                        api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messageID);
                    return null; 
                }
                var lang = handleNeedExec.languages[global.config.language][value[0]] || '';
                // ✅ fixed loop
                for (var i = value.length - 1; i > 0; i--) {
                    const expReg = RegExp('%' + i, 'g');
                    lang = lang.replace(expReg, value[i]);
                }
                return lang;
            };
        } else return () => {};
    };

    return async function ({ event }) {
        if (!event.messageReply) return;

        const { handleReply, commands } = global.client || {};
        if (!handleReply || !commands) return;

        const { messageID, threadID, messageReply } = event;
        if (!messageID || !threadID || !messageReply) return;

        // ✅ safeguard for Map
        const handleReplyMap = handleReply instanceof Map ? handleReply : new Map();
        const indexOfMessage = handleReplyMap.get(messageReply.messageID);
        if (!indexOfMessage || !indexOfMessage.name) return;

        const handleNeedExec = commands.get(indexOfMessage.name);
        if (!handleNeedExec || !handleNeedExec.handleReply) {
            handleReplyMap.delete(messageReply.messageID);
            return api.sendMessage(global.getText('handleReply', 'missingValue'), threadID, messageID);
        }

        try {
            const getText2 = createGetText2(handleNeedExec, threadID, messageID, api);
            if (getText2 === null) return;

            const Obj = {};
            Obj.api = api;
            Obj.event = event;
            Obj.models = models;
            Obj.Users = Users;
            Obj.Threads = Threads;
            Obj.Currencies = Currencies;
            Obj.handleReply = indexOfMessage;
            Obj.getText = getText2;

            await handleNeedExec.handleReply(Obj);

        } catch (error) {
            logger(global.getText('handleReply', 'executeError', error.stack || error.message), "error");
            return api.sendMessage(global.getText('handleReply', 'executeError', "An unexpected error occurred."), threadID, messageID);
        }
    };
};

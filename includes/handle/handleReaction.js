module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js"); // ✅ Logger added

    // Optimized getText2 creation: Define a factory function
    const createGetText2 = (handleNeedExec, threadID, messageID, api) => {
        if (handleNeedExec.languages && typeof handleNeedExec.languages === 'object') {
            return (...value) => {
                const languageModule = handleNeedExec.languages || {};
                if (!languageModule.hasOwnProperty(global.config.language)) {
                    // ✅ Safeguard: threadID/messageID may be undefined
                    if (threadID && messageID)
                        api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messageID);
                    return null; 
                }
                var lang = handleNeedExec.languages[global.config.language][value[0]] || '';
                // ✅ Fixed loop index
                for (var i = value.length - 1; i > 0; i--) {
                    const expReg = RegExp('%' + i, 'g');
                    lang = lang.replace(expReg, value[i]);
                }
                return lang;
            };
        } else {
            return () => {};
        }
    };

    return async function ({ event }) { // async handler
        const { handleReaction, commands } = global.client || {};
        if (!handleReaction || !commands) return;

        const { messageID, threadID } = event;
        if (!messageID || !threadID) return;

        // ✅ Safeguard for Map
        const handleReactionMap = handleReaction instanceof Map ? handleReaction : new Map();
        const indexOfMessage = handleReactionMap.get(messageID);
        if (!indexOfMessage || !indexOfMessage.name) return;

        const handleNeedExec = commands.get(indexOfMessage.name);
        if (!handleNeedExec || !handleNeedExec.handleReaction) {
            // Clean up if command is missing
            handleReactionMap.delete(messageID);
            return api.sendMessage(global.getText('handleReaction', 'missingValue'), threadID, messageID);
        }

        try {
            const getText2 = createGetText2(handleNeedExec, threadID, messageID, api);
            if (getText2 === null) return; // language not found error handled inside factory

            const Obj = {};
            Obj.api = api;
            Obj.event = event;
            Obj.models = models;
            Obj.Users = Users;
            Obj.Threads = Threads;
            Obj.Currencies = Currencies;
            Obj.handleReaction = indexOfMessage;
            Obj.getText = getText2;

            // ✅ Use await for async function
            await handleNeedExec.handleReaction(Obj);

        } catch (error) {
            // ✅ Safeguard: log the error properly
            logger(global.getText('handleReaction', 'executeError', error.stack || error.message), "error");
            return api.sendMessage(global.getText('handleReaction', 'executeError', "An unexpected error occurred."), threadID, messageID);
        }
    };
};

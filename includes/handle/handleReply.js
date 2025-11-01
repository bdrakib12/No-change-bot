module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return function ({ event }) {
        if (!event.messageReply) return;
        const { handleReply, commands } = global.client;
        const { messageID, threadID, messageReply } = event;
        if (!handleReply || handleReply.length === 0) return;

        const indexOfHandle = handleReply.findIndex(e => e.messageID === messageReply.messageID);
        if (indexOfHandle < 0) return;

        const handleInfo = handleReply[indexOfHandle];
        const command = commands.get(handleInfo.name);
        if (!command) return api.sendMessage(global.getText('handleReply', 'missingValue'), threadID, messageID);

        const getText = (...values) => {
            if (!command.languages?.[global.config.language]) return '';
            let text = command.languages[global.config.language][values[0]] || '';
            for (let i = 0; i < values.length; i++) text = text.replace(new RegExp(`%${i + 1}`, 'g'), values[i]);
            return text;
        };

        try {
            command.handleReply({ api, event, models, Users, Threads, Currencies, handleReply: handleInfo, getText });
        } catch (error) {
            return api.sendMessage(global.getText('handleReply', 'executeError', String(error)), threadID, messageID);
        }
    };
};

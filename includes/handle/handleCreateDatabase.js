module.exports = function ({ Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    return async function ({ event }) {
        const { allUserID, allCurrenciesID, allThreadID, userName, threadInfo } = global.data; 
        const { autoCreateDB } = global.config;

        // ✅ safer boolean check
        if (!autoCreateDB) return;

        var { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        try {
            // --- Thread Creation ---
            if (!allThreadID.has(threadID) && event.isGroup == true) {
                const threadIn4 = await Threads.getInfo(threadID);

                const setting = {
                    threadName: threadIn4.threadName,
                    adminIDs: threadIn4.adminIDs,
                    nicknames: threadIn4.nicknames,
                };
                allThreadID.set(threadID, true);
                threadInfo.set(threadID, setting);

                const setting2 = { threadInfo: setting, data: {} };
                await Threads.setData(threadID, setting2);

                // --- User Creation inside thread ---
                const usersInThread = threadIn4.userInfo || []; // ✅ safeguard null
                const userCreationPromises = [];

                for (const singleData of usersInThread) {
                    const userID = String(singleData.id);
                    userName.set(userID, singleData.name);

                    if (!allUserID.has(userID)) {
                        userCreationPromises.push((async () => {
                            try {
                                await Users.createData(userID, { name: singleData.name, data: {} });
                                allUserID.set(userID, true);
                                logger(global.getText('handleCreateDatabase', 'newUser', userID), '[ DATABASE ]');
                            } catch (err) {
                                logger(err.stack || err.message, '[ DATABASE ERROR ]');
                            }
                        })());
                    } else if (userName.get(userID) !== singleData.name) {
                        try {
                            await Users.setData(userID, { name: singleData.name });
                        } catch (err) {
                            logger(err.stack || err.message, '[ DATABASE ERROR ]');
                        }
                    }
                }

                await Promise.allSettled(userCreationPromises); // ✅ prevent crash

                logger(global.getText('handleCreateDatabase', 'newThread', threadID), '[ DATABASE ]');
            }

            // --- Single User Creation/Update ---
            if (!allUserID.has(senderID)) {
                try {
                    const infoUsers = await Users.getInfo(senderID);
                    const setting3 = { name: infoUsers.name, data: {} };
                    await Users.createData(senderID, setting3);
                    allUserID.set(senderID, true);
                    userName.set(senderID, infoUsers.name);
                    logger(global.getText('handleCreateDatabase', 'newUser', senderID), '[ DATABASE ]');
                } catch (err) {
                    logger(err.stack || err.message, '[ DATABASE ERROR ]');
                }
            } else if (!userName.has(senderID)) {
                try {
                    const infoUsers = await Users.getInfo(senderID);
                    userName.set(senderID, infoUsers.name);
                    await Users.setData(senderID, { name: infoUsers.name });
                } catch (err) {
                    logger(err.stack || err.message, '[ DATABASE ERROR ]');
                }
            }

            // --- Currency Data Creation ---
            if (!allCurrenciesID.has(senderID)) {
                try {
                    const setting4 = { data: {} };
                    await Currencies.createData(senderID, setting4);
                    allCurrenciesID.set(senderID, true);
                } catch (err) {
                    logger(err.stack || err.message, '[ DATABASE ERROR ]');
                }
            }

            return;
        } catch (err) {
            logger(err.stack || err.message, "[ DATABASE ERROR ]");
            return;
        }
    };
};

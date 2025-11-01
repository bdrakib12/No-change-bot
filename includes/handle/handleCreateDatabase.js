module.exports = function ({ Users, Threads, Currencies }) {
  const logger = require("../../utils/log.js");

  return async function ({ event }) {
    const { allUserID, allCurrenciesID, allThreadID, userName, threadInfo } = global.data;
    const { autoCreateDB } = global.config;
    if (autoCreateDB === false) return;

    let { senderID, threadID } = event;
    senderID = String(senderID);
    threadID = String(threadID);

    try {
      // নতুন থ্রেড তৈরি
      if (!allThreadID.includes(threadID) && event.isGroup === true) {
        const threadIn4 = await Threads.getInfo(threadID);
        const dataThread = {
          threadName: threadIn4.threadName,
          adminIDs: threadIn4.adminIDs,
          nicknames: threadIn4.nicknames
        };

        allThreadID.push(threadID);
        if (!threadInfo.has(threadID)) threadInfo.set(threadID, dataThread);

        await Threads.setData(threadID, { threadInfo: dataThread, data: {} });

        for (const singleData of threadIn4.userInfo) {
          const userId = String(singleData.id);
          userName.set(userId, singleData.name);

          if (!global.data.allUserID.includes(userId)) {
            await Users.createData(userId, { name: singleData.name, data: {} });
            global.data.allUserID.push(userId);
            logger(global.getText('handleCreateDatabase', 'newUser', userId), '[ DATABASE ]');
          } else {
            await Users.setData(userId, { name: singleData.name });
          }
        }

        logger(global.getText('handleCreateDatabase', 'newThread', threadID), '[ DATABASE ]');
      }

      // নতুন ইউজার তৈরি
      if (!allUserID.includes(senderID) || !userName.has(senderID)) {
        let infoUsers = {};
        try {
          infoUsers = await Users.getInfo(senderID);
        } catch {
          infoUsers.name = "Unknown User";
        }

        await Users.createData(senderID, { name: infoUsers.name });
        allUserID.push(senderID);
        userName.set(senderID, infoUsers.name);
        logger(global.getText('handleCreateDatabase', 'newUser', senderID), '[ DATABASE ]');
      }

      // নতুন কারেন্সি তৈরি
      if (!allCurrenciesID.includes(senderID)) {
        await Currencies.createData(senderID, { data: {} });
        allCurrenciesID.push(senderID);
      }

    } catch (err) {
      logger(`[ DATABASE ERROR ] ${err.message}`, 'error');
    }
  };
};

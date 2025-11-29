const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "announce",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Rakib Hasan",
  description: "Send a message to all groups where the bot is present (robust & cache fallback)",
  commandCategory: "Admin",
  usages: "reply or announce <message> | announce --force-add (to add current group to cache)",
  cooldowns: 5
};

const CACHE_FILE = path.join(__dirname, 'all_threads_cache.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function safeStringifyError(err) {
  try {
    if (!err) return 'Unknown error (no error object)';
    if (err.message) return err.message;
    return typeof err === 'string' ? err : JSON.stringify(err);
  } catch (e) {
    return String(err);
  }
}

async function readCache() {
  try {
    if (await fs.pathExists(CACHE_FILE)) {
      const txt = await fs.readFile(CACHE_FILE, 'utf8');
      const arr = JSON.parse(txt);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

async function writeCache(arr) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(Array.from(new Set(arr)), null, 2), 'utf8');
  } catch (e) {
    console.error('[announce] failed to write cache:', e);
  }
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply } = event;

  // ---- CONFIG ----
  const ownerIDs = ["61581351693349"];
  const delayBetween = 600; // ms
  // -----------------

  if (!ownerIDs.includes(String(senderID))) {
    return api.sendMessage("❌ এই কমান্ড শুধু বট Owner ব্যবহার করতে পারবে।", threadID, messageID);
  }

  // support "--force-add" where owner can add current group to local cache
  if (args && args.length && args[0] === '--force-add') {
    try {
      let cache = await readCache();
      cache.push(threadID);
      await writeCache(cache);
      return api.sendMessage(`✅ এই গ্রুপটি cache-এ যোগ করা হলো (threadID: ${threadID}).\nএখন থেকে announce কমান্ডে এই গ্রুপটি ধরা হবে।`, threadID, messageID);
    } catch (e) {
      return api.sendMessage(`❌ Cache update failed: ${safeStringifyError(e)}`, threadID, messageID);
    }
  }

  // get message content
  let content = "";
  if (messageReply && messageReply.body && messageReply.body.trim()) {
    content = messageReply.body.trim();
  } else if (args && args.length > 0) {
    content = args.join(" ").trim();
  }

  if (!content) {
    return api.sendMessage("❌ পাঠানোর জন্য message লিখো বা কোনো message-এ reply করো।", threadID, messageID);
  }

  try {
    let threads = [];
    let fetched = false;
    // 1) try callback-style getThreadList(limit, before, cb)
    try {
      threads = await new Promise((resolve, reject) => {
        try {
          if (typeof api.getThreadList === 'function') {
            api.getThreadList(100, null, (err, list) => {
              if (err) return reject(err);
              return resolve(list || []);
            });
          } else {
            return reject(new Error('api.getThreadList not a function'));
          }
        } catch (e) {
          return reject(e);
        }
      });
      fetched = true;
      console.log('[announce] fetched threads via getThreadList callback-style');
    } catch (err1) {
      console.log('[announce] getThreadList callback failed:', safeStringifyError(err1));
    }

    // 2) try promise-style getThreadList(limit, before)
    if (!fetched) {
      try {
        if (typeof api.getThreadList === 'function') {
          const maybe = api.getThreadList(100, null);
          if (maybe && typeof maybe.then === 'function') {
            threads = await maybe;
            fetched = true;
            console.log('[announce] fetched threads via getThreadList promise-style');
          }
        }
      } catch (err2) {
        console.log('[announce] getThreadList promise-style failed:', safeStringifyError(err2));
      }
    }

    // 3) try getThreads
    if (!fetched) {
      try {
        if (typeof api.getThreads === 'function') {
          threads = await new Promise((resolve, reject) => {
            api.getThreads(100, null, (err, list) => {
              if (err) return reject(err);
              resolve(list || []);
            });
          });
          fetched = true;
          console.log('[announce] fetched threads via getThreads');
        }
      } catch (err3) {
        console.log('[announce] getThreads failed:', safeStringifyError(err3));
      }
    }

    // 4) try other promise variations
    if (!fetched) {
      try {
        if (typeof api.getThreadListAsync === 'function') {
          threads = await api.getThreadListAsync(100, 0);
          fetched = true;
          console.log('[announce] fetched threads via getThreadListAsync');
        } else if (typeof api.getThreadListPromise === 'function') {
          threads = await api.getThreadListPromise(100, 0);
          fetched = true;
          console.log('[announce] fetched threads via getThreadListPromise');
        }
      } catch (err4) {
        console.log('[announce] alternative getThreadList methods failed:', safeStringifyError(err4));
      }
    }

    // 5) try global caches commonly used by some bots
    if (!fetched) {
      try {
        const globalSources = [];
        if (global && global.data && global.data.threadInfo) {
          globalSources.push(Object.keys(global.data.threadInfo));
        }
        if (global && global.data && global.data.allThreadID) {
          globalSources.push(global.data.allThreadID);
        }
        if (global && global.allThreadID) {
          globalSources.push(global.allThreadID);
        }
        if (global && global.Threads) {
          try { globalSources.push(Object.keys(global.Threads)); } catch(e){}
        }
        // flatten and dedupe
        const flat = [].concat(...globalSources).filter(Boolean);
        if (flat && flat.length) {
          threads = flat.map(id => ({ threadID: id }));
          fetched = true;
          console.log('[announce] fetched threads via global cache(s)');
        }
      } catch (err5) {
        console.log('[announce] global cache check failed:', safeStringifyError(err5));
      }
    }

    // 6) try reading local cache file
    if (!fetched) {
      const cached = await readCache();
      if (cached && cached.length) {
        threads = cached.map(id => ({ threadID: id }));
        fetched = true;
        console.log('[announce] fetched threads via local cache file');
      }
    }

    if (!fetched) {
      throw new Error('Unable to fetch thread list: no supported getThreadList/getThreads method found or all attempts failed.');
    }

    // normalize threads array
    threads = Array.isArray(threads) ? threads : [];
    // sometimes API returns object with .threads
    if (!Array.isArray(threads) && threads && threads.threads) {
      threads = Array.from(threads.threads);
    }

    // build list of threadIDs (dedup)
    const threadIDs = Array.from(new Set(
      threads
        .map(t => t && (t.threadID || t.id || t.threadId || t.thread_id || t))
        .filter(Boolean)
    ));

    if (!threadIDs.length) {
      throw new Error('No thread IDs discovered from the fetched thread list.');
    }

    // optionally try to filter groups if we have participant info in thread objects
    // but if we only have IDs from cache, we'll send to all those IDs.
    // send starter progress
    await new Promise((res) => api.sendMessage(`📢 Announcement শুরু... মোট লক্ষ্যমাত্রা: ${threadIDs.length}`, threadID, () => res()));

    let success = 0;
    let failed = 0;

    for (const id of threadIDs) {
      try {
        // detect sendMessage signature and call accordingly
        const sendArgs = { body: content };
        if (api.sendMessage.length === 3) {
          await new Promise((resolve) => api.sendMessage(sendArgs, id, () => resolve()));
        } else {
          // many libs return a promise
          await api.sendMessage(sendArgs, id);
        }
        success++;
      } catch (e) {
        console.log(`[announce] failed to send to ${id}:`, safeStringifyError(e));
        failed++;
      }
      await sleep(delayBetween);
    }

    // save any newly seen threadIDs to cache (merge)
    try {
      const existing = await readCache();
      const merged = Array.from(new Set([...(existing || []), ...threadIDs]));
      await writeCache(merged);
    } catch (e) {
      // ignore
    }

    await new Promise((res) => api.sendMessage(
      `✅ Announcement Complete!\nসফল: ${success}\nব্যর্থ: ${failed}\nমোট লক্ষ্যমাত্রা: ${threadIDs.length}`,
      threadID,
      () => res()
    ));

  } catch (error) {
    const errText = safeStringifyError(error);
    console.error('[announce] fatal error:', errText, error);
    return api.sendMessage(`❌ Announcement ব্যর্থ হয়েছে।\nError: ${errText}`, threadID, messageID);
  }
};

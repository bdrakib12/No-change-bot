/**
 * autoThreadCache.js
 * Aggressive auto-catch of threadIDs even when commands are NOT run.
 * Place this file inside your modules folder and restart the bot.
 *
 * Features:
 * - Try to enable event listening (api.setOptions({ listenEvents: true }))
 * - Attach listeners to message/event/subscribe/typing/presence/read to auto-add threadIDs
 * - Populate cache on load using multiple getThreadList/getThreads signatures
 * - Provide a simple run() command: autoThreadCache status|list|add|clear
 *
 * Cache file: modules/all_threads_cache.json
 */

const fs = require('fs-extra');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'all_threads_cache.json');
const LOG = '[autoThreadCache]';

async function readCache() {
  try {
    if (await fs.pathExists(CACHE_FILE)) {
      const txt = await fs.readFile(CACHE_FILE, 'utf8');
      const arr = JSON.parse(txt);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {
    console.log(`${LOG} readCache error:`, e && e.message ? e.message : e);
  }
  return [];
}

async function writeCache(arr) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(Array.from(new Set(arr)), null, 2), 'utf8');
  } catch (e) {
    console.log(`${LOG} writeCache error:`, e && e.message ? e.message : e);
  }
}

async function addToCache(threadID) {
  if (!threadID) return false;
  try {
    const existing = await readCache();
    if (!existing.includes(threadID)) {
      existing.push(threadID);
      await writeCache(existing);
      console.log(`${LOG} added thread to cache: ${threadID}`);
      return true;
    }
  } catch (e) {
    console.log(`${LOG} addToCache error:`, e && e.message ? e.message : e);
  }
  return false;
}

async function clearCache() {
  try {
    await writeCache([]);
    console.log(`${LOG} cache cleared`);
  } catch (e) {
    console.log(`${LOG} clearCache error:`, e && e.message ? e.message : e);
  }
}

function safeErrorText(e) {
  try {
    if (!e) return 'Unknown error';
    if (e.message) return e.message;
    return typeof e === 'string' ? e : JSON.stringify(e);
  } catch (err) {
    return String(e);
  }
}

/* ---------- thread-list fetch helpers ---------- */

async function tryFetchThreadList(api) {
  let threads = [];
  let fetched = false;

  // try to enable event listen mode first (some libs need this)
  try {
    if (api && typeof api.setOptions === 'function') {
      try { api.setOptions({ listenEvents: true }); console.log(`${LOG} setOptions(listenEvents:true) called`); } catch (e) { /* ignore */ }
    }
  } catch (e) {}

  // 1) callback-style getThreadList(limit, before, cb)
  try {
    if (api && typeof api.getThreadList === 'function') {
      const res = await new Promise((resolve, reject) => {
        try {
          api.getThreadList(100, null, (err, list) => {
            if (err) return reject(err);
            resolve(list || []);
          });
        } catch (ex) {
          reject(ex);
        }
      });
      threads = res;
      fetched = true;
      console.log(`${LOG} fetched via api.getThreadList(callback)`);
    }
  } catch (e) {
    console.log(`${LOG} getThreadList(callback) failed:`, safeErrorText(e));
  }

  // 2) promise-style getThreadList(limit, before)
  if (!fetched) {
    try {
      if (api && typeof api.getThreadList === 'function') {
        const maybe = api.getThreadList(100, null);
        if (maybe && typeof maybe.then === 'function') {
          const res = await maybe;
          threads = res;
          fetched = true;
          console.log(`${LOG} fetched via api.getThreadList(promise)`);
        }
      }
    } catch (e) {
      console.log(`${LOG} getThreadList(promise) failed:`, safeErrorText(e));
    }
  }

  // 3) getThreads callback
  if (!fetched) {
    try {
      if (api && typeof api.getThreads === 'function') {
        const res = await new Promise((resolve, reject) => {
          api.getThreads(100, null, (err, list) => {
            if (err) return reject(err);
            resolve(list || []);
          });
        });
        threads = res;
        fetched = true;
        console.log(`${LOG} fetched via api.getThreads(callback)`);
      }
    } catch (e) {
      console.log(`${LOG} getThreads failed:`, safeErrorText(e));
    }
  }

  // 4) try other async variations
  if (!fetched) {
    try {
      if (api && typeof api.getThreadListAsync === 'function') {
        threads = await api.getThreadListAsync(100, 0);
        fetched = true;
        console.log(`${LOG} fetched via api.getThreadListAsync`);
      } else if (api && typeof api.getThreadListPromise === 'function') {
        threads = await api.getThreadListPromise(100, 0);
        fetched = true;
        console.log(`${LOG} fetched via api.getThreadListPromise`);
      }
    } catch (e) {
      console.log(`${LOG} alternative getThreadList failed:`, safeErrorText(e));
    }
  }

  // 5) try global caches (many Miari forks keep thread lists global)
  if (!fetched) {
    try {
      const globalSources = [];
      if (global && global.data && global.data.threadInfo) globalSources.push(Object.keys(global.data.threadInfo));
      if (global && global.data && global.data.allThreadID) globalSources.push(global.data.allThreadID);
      if (global && global.allThreadID) globalSources.push(global.allThreadID);
      if (global && global.Threads) {
        try { globalSources.push(Object.keys(global.Threads)); } catch(e){}
      }
      const flat = [].concat(...globalSources).filter(Boolean);
      if (flat && flat.length) {
        threads = flat.map(id => ({ threadID: id }));
        fetched = true;
        console.log(`${LOG} fetched via global caches`);
      }
    } catch (e) {
      console.log(`${LOG} global cache check failed:`, safeErrorText(e));
    }
  }

  // Normalize to unique threadIDs
  try {
    if (Array.isArray(threads)) {
      const ids = threads.map(t => {
        if (!t) return null;
        if (typeof t === 'string') return t;
        return t.threadID || t.id || t.threadId || t.thread_id || null;
      }).filter(Boolean);
      return Array.from(new Set(ids));
    } else if (threads && typeof threads === 'object' && threads.threads && Array.isArray(threads.threads)) {
      return Array.from(new Set(threads.threads.map(t => t.threadID || t.id || t)));
    }
  } catch (e) {
    console.log(`${LOG} normalize error:`, safeErrorText(e));
  }
  return [];
}

/* ---------- event attach ---------- */

function attachListeners(api) {
  if (!api) {
    console.log(`${LOG} attachListeners: no api object`);
    return;
  }

  // unified handler for events
  const onEvent = async (ev) => {
    try {
      if (!ev) return;
      // try multiple paths to extract threadID
      const tid =
        ev.threadID ||
        (ev.message && (ev.message.threadID || ev.message.threadId)) ||
        (ev.thread && (ev.thread.threadID || ev.thread.threadId)) ||
        (ev.logMessageData && ev.logMessageData.threadID) ||
        (ev.threadID && ev.threadID);

      if (tid) {
        await addToCache(tid);
      }

      // handle subscribe logs where bot is added
      // event.logMessageType == 'log:subscribe' or ev.logMessageData
      try {
        if (ev.logMessageType === 'log:subscribe' || (ev.logMessageData && ev.logMessageData.addedParticipants)) {
          const added = ev.logMessageData ? ev.logMessageData.addedParticipants : ev.addedParticipants;
          if (Array.isArray(added)) {
            // try detect bot id
            let botId = null;
            try {
              if (typeof api.getCurrentUserID === 'function') botId = String(await api.getCurrentUserID());
              else if (typeof api.getCurrentUserID === 'function') botId = String(await api.getCurrentUserID());
            } catch (e) { /* ignore */ }
            const ids = added.map(p => (p.id ? String(p.id) : (p.userID ? String(p.userID) : String(p))));
            if (!botId || ids.includes(botId)) {
              // add thread
              const t = ev.threadID || (ev.logMessageData && ev.logMessageData.threadID) || (ev.thread && ev.thread.threadID);
              if (t) await addToCache(t);
            }
          }
        }
      } catch (e) { /* ignore */ }
    } catch (e) {
      // never crash
      console.log(`${LOG} onEvent error:`, safeErrorText(e));
    }
  };

  // try multiple attach methods
  try {
    if (typeof api.on === 'function') {
      try {
        api.on('message', onEvent);
      } catch (e) {}
      try { api.on('event', onEvent); } catch (e) {}
      try { api.on('message_event', onEvent); } catch (e) {}
      console.log(`${LOG} listeners attached via api.on`);
      return;
    }
  } catch (e) {
    console.log(`${LOG} api.on attach failed:`, safeErrorText(e));
  }

  try {
    if (typeof api.listen === 'function') {
      api.listen(onEvent);
      console.log(`${LOG} listeners attached via api.listen`);
      return;
    }
  } catch (e) {
    console.log(`${LOG} api.listen attach failed:`, safeErrorText(e));
  }

  try {
    if (global && global.client && typeof global.client.on === 'function') {
      global.client.on('message', onEvent);
      global.client.on('event', onEvent);
      console.log(`${LOG} listeners attached via global.client.on`);
      return;
    }
  } catch (e) {
    console.log(`${LOG} global.client attach failed:`, safeErrorText(e));
  }

  // fallback: sometimes modules are invoked for every message and we can rely on that.
  console.log(`${LOG} No supported event attach method found - runtime auto-add might not work. Use 'autoThreadCache add' or keep this module loaded in a place where run() is invoked for messages.`);
}

/* ---------- onLoad ---------- */

module.exports.onLoad = async function ({ api }) {
  try {
    console.log(`${LOG} onLoad start`);
    if (!api) {
      console.log(`${LOG} no api provided to onLoad`);
      return;
    }

    // try fetch list and populate cache
    try {
      const ids = await tryFetchThreadList(api);
      if (ids && ids.length) {
        await writeCache(ids);
        console.log(`${LOG} initial cache populated with ${ids.length} threadIDs`);
      } else {
        console.log(`${LOG} no threadIDs fetched onLoad`);
      }
    } catch (e) {
      console.log(`${LOG} initial fetch error:`, safeErrorText(e));
    }

    // attach runtime listeners
    attachListeners(api);
  } catch (e) {
    console.log(`${LOG} onLoad fatal error:`, safeErrorText(e));
  }
};

/* ---------- run (manual interface) ---------- */

module.exports.config = {
  name: 'autoThreadCache',
  version: '1.3.0',
  hasPermssion: 0,
  credits: 'Rakib Hasan',
  description: 'Auto thread cache (aggressive). Usage: autoThreadCache status|list|add|clear',
  commandCategory: 'System',
  usages: 'autoThreadCache status|list|add|clear',
  cooldowns: 1
};

module.exports.run = async function ({ api, event, args }) {
  if (!api || !event) return;
  const { threadID, messageID } = event;
  const sub = args && args[0] ? args[0].toLowerCase() : 'status';

  try {
    if (sub === 'status') {
      const arr = await readCache();
      return api.sendMessage(`Auto cache size: ${arr.length}`, threadID, messageID);
    } else if (sub === 'list') {
      const arr = await readCache();
      if (!arr.length) return api.sendMessage('Cache is empty', threadID, messageID);
      // avoid spam: if large, only show first 50
      const show = arr.slice(0, 50).join('\n');
      return api.sendMessage(`Cached threads (${arr.length}):\n${show}${arr.length > 50 ? '\n... (truncated)' : ''}`, threadID, messageID);
    } else if (sub === 'add') {
      const ok = await addToCache(threadID);
      return api.sendMessage(ok ? `Added current thread to cache: ${threadID}` : `Already in cache or failed to add: ${threadID}`, threadID, messageID);
    } else if (sub === 'clear') {
      await clearCache();
      return api.sendMessage('Cache cleared', threadID, messageID);
    } else {
      return api.sendMessage('Usage: autoThreadCache status | list | add | clear', threadID, messageID);
    }
  } catch (e) {
    return api.sendMessage(`Error: ${safeErrorText(e)}`, threadID, messageID);
  }
};

/* ---------- try auto-init if module loader doesn't call onLoad ---------- */

(async function tryAutoInit() {
  try {
    // attempt to detect global api/client
    const api = (global && (global.api || global.client)) || null;
    if (api && typeof module.exports.onLoad === 'function') {
      setTimeout(() => {
        try {
          module.exports.onLoad({ api });
        } catch (e) { /* ignore */ }
      }, 1500);
    } else {
      console.log(`${LOG} no global api/client found at module load time; waiting for onLoad hook.`);
    }
  } catch (e) {
    // ignore
  }
})();

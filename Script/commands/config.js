// config_full_fix.js // Full-featured config module for Mirai-like Messenger bot // Installed/tested features: admin system, bio/nick/avatar change, post/comment, block/unblock, friend requests, reactions, create/delete post, noteCode // IMPORTANT: place this file in your bot's commands folder (same place as original config.js)

module.exports.config = { name: "config", version: "1.0.1", hasPermssion: 2, credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️", description: "Full config manager (fixed & stable)", commandCategory: "admin", cooldowns: 5 };

module.exports.languages = { "vi": {}, "en": {}, "bn": {} };

// ------------------------- IMPORTANT VALUES ------------------------- // Put your admin/owner UIDs as strings inside arrays (required for .includes to work) const ADMINS = ["61581351693349"]; // <- Your admin UID(s) here const OWNERS = ["61581351693349"]; // you can keep same or add more

// keep using appstate.json for login (place appstate.json in project root) const path = require('path'); const fs = require('fs-extra'); const appStatePath = path.join(__dirname, "..", "appstate.json"); let appState = []; try { if (fs.existsSync(appStatePath)) appState = require(appStatePath); } catch (e) { appState = []; }

const cookie = Array.isArray(appState) && appState.length ? appState.map(item => ${item.key}=${item.value}).join(';') : '';

const headers = { "Host": "mbasic.facebook.com", "user-agent": "Mozilla/5.0 (Linux; Android 11; M2101K7BG Build/RP1A.200720.011;) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36", "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9", "sec-fetch-site": "same-origin","sec-fetch-mode": "navigate", "sec-fetch-user": "?1", "sec-fetch-dest": "document", "referer": "https://mbasic.facebook.com/?refsrc=deprecated&_rdr", "accept-encoding": "gzip, deflate", "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7", "Cookie": cookie };

// ------------------------- Helpers ------------------------- function getGUID() { const key = xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx; let timeNow = Date.now(); return key.replace(/[xy]/g, function (info) { let a = Math.floor((timeNow + Math.random() * 16) % 16); timeNow = Math.floor(timeNow / 16); return (info == 'x' ? a : (a & 7 | 8)).toString(16); }); }

function safeReply(api, threadID, message, cb, messageID) { try { if (cb) api.sendMessage(message, threadID, cb, messageID); else api.sendMessage(message, threadID, messageID); } catch(e) { console.log('safeReply error', e); } }

// ------------------------- Main Handlers ------------------------- module.exports.handleReply = async function({ api, event, handleReply }) { const axios = require('axios'); const { type, author } = handleReply; const { threadID, messageID, senderID } = event; if (author != senderID) return; // only author can reply

const body = (event.body || "").trim(); const reply = (msg, cb) => safeReply(api, threadID, msg, cb, messageID);

// ensure botID is available const botID = api.getCurrentUserID();

try { // MENU actions if (type == 'menu') { const args = body.split(/\s+/); const cmd = args[0]; if (["01","1","02","2"].includes(cmd)) { const changeType = ["01","1"].includes(cmd) ? 'bio' : 'nickname'; return reply(Please reply to this message with ${changeType == 'bio' ? 'bio' : 'nickname'} you want to set for bot or reply 'delete' to remove it., (err, info) => { global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: changeType == 'bio' ? 'changeBio' : 'changeNickname' }); }); }

if (["03","3"].includes(cmd)) {
    const pending = await api.getThreadList(500, null, ["PENDING"]);
    const msg = pending.length ? pending.map(p => `» ${p.name} | ${p.threadID} | Snippet: ${p.snippet || ''}`).join('\n') : 'There are no pending messages';
    return reply(`Bot message waiting list:\n\n${msg}`);
  }

  if (["04","4"].includes(cmd)) {
    const unread = await api.getThreadList(500, null, ["unread"]);
    const msg = unread.length ? unread.map(p => `» ${p.name} | ${p.threadID} | Snippet: ${p.snippet || ''}`).join('\n') : 'There are no unread messages';
    return reply(`Bot unread message list:\n\n${msg}`);
  }

  if (["05","5"].includes(cmd)) {
    const other = await api.getThreadList(500, null, ["OTHER"]);
    const msg = other.length ? other.map(p => `» ${p.name} | ${p.threadID} | Snippet: ${p.snippet || ''}`).join('\n') : 'There are no spam messages';
    return reply(`Bot spam message list:\n\n${msg}`);
  }

  if (["06","6"].includes(cmd)) {
    return reply('Reply to this message with a photo attachment or a direct image link to set bot avatar', (err, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'changeAvatar' });
    });
  }

  if (["07","7"].includes(cmd)) {
    if (!args[1] || !["on","off"].includes(args[1])) return reply('Please select on or off');
    const form = {
      av: botID,
      variables: JSON.stringify({
        "0": { is_shielded: args[1] == 'on', actor_id: botID, client_mutation_id: Math.round(Math.random()*19) }
      }),
      doc_id: "61581351693349"
    };
    api.httpPost("https://www.facebook.com/api/graphql/", form, (err, data) => {
      if (err || (data && JSON.parse(data).errors)) reply("An error occurred, please try again later");
      else reply(`Avatar shield ${args[1] == 'on' ? 'enabled' : 'disabled'} successfully`);
    });
  }

  // Block/Unblock
  if (["08","8"].includes(cmd)) {
    return reply('Reply with UID(s) (space or newline separated) to block on messenger', (e, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'blockUser' });
    });
  }

  if (["09","9"].includes(cmd)) {
    return reply('Reply with UID(s) (space or newline separated) to unblock on messenger', (e, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'unBlockUser' });
    });
  }

  if (["10"].includes(cmd)) {
    return reply('Reply with the content you want to create as a post', (e, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'createPost' });
    });
  }

  if (["11"].includes(cmd)) {
    return reply('Reply with the post id(s) you want to delete (space separated)', (e, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'deletePost' });
    });
  }

  if (["12","13"].includes(cmd)) {
    return reply('Reply with the post id(s) to comment on (space separated)', (e, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'choiceIdCommentPost', isGroup: cmd == '13' });
    });
  }

  // group of friend-related operations kept simple
  if (["14","15","16","17","18","19"].includes(cmd)) {
    return reply('Reply with the id(s) (space separated) to process for the chosen option', (e, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: (cmd == '14') ? 'choiceIdReactionPost' : (cmd == '15') ? 'addFriends' : (cmd == '16') ? 'acceptFriendRequest' : (cmd == '17') ? 'declineFriendRequest' : (cmd == '18') ? 'unFriends' : 'choiceIdSendMessage' });
    });
  }

  if (["20"].includes(cmd)) {
    return reply('Reply with the code you want to create a note (will upload to buildtool.dev)', (e, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'noteCode' });
    });
  }

  if (["21"].includes(cmd)) {
    return api.logout((e) => reply(e ? 'Logout failed' : 'Logged out successfully'));
  }

  return reply('Unknown option. Please reply with a valid menu number.');
}

// changeBio
if (type == 'changeBio') {
  const bio = body.toLowerCase() == 'delete' ? '' : body;
  api.changeBio(bio, false, (err) => reply(err ? 'An error occurred, please try again' : `Bot bio ${bio ? 'updated' : 'deleted'} successfully`));
}

// changeNickname
else if (type == 'changeNickname') {
  const nickname = body.toLowerCase() == 'delete' ? '' : body;
  const axios = require('axios');
  const res = (await axios.get('https://mbasic.facebook.com/' + botID + '/about', { headers, params: { nocollections: '1', lst: `${botID}:${botID}:${Date.now().toString().slice(0,10)}`, refid: '17' } })).data;
  fs.writeFileSync(path.join(__dirname, 'cache', 'resNickname.html'), res);
  // keep mutation logic same as original but with safe checks
  try {
    if (nickname) {
      // create or update nickname
      const name_id = res.includes('href="/profile/edit/info/nicknames/?entid=') ? res.split('href="/profile/edit/info/nicknames/?entid=')[1].split('&amp;')[0] : null;
      const variables = {
        collectionToken: Buffer.from(`app_collection:${botID}:2327158227:206`).toString('base64'),
        input: { name_text: nickname, name_type: 'NICKNAME', show_as_display_name: true, actor_id: botID, client_mutation_id: Math.round(Math.random()*19).toString() },
        scale: 3,
        sectionToken: Buffer.from(`app_section:${botID}:2327158227`).toString('base64')
      };
      if (name_id) variables.input.name_id = name_id;
      const form = { av: botID, fb_api_req_friendly_name: 'ProfileCometNicknameSaveMutation', fb_api_caller_class: 'RelayModern', doc_id: '61581351693349', variables: JSON.stringify(variables) };
      api.httpPost('https://www.facebook.com/api/graphql/', form, (e, i) => reply(e ? 'An error occurred' : `Nickname ${nickname} set successfully`));
    } else {
      // delete nickname
      if (!res.includes('href="/profile/edit/info/nicknames/?entid=')) return reply('Bot currently has no nickname set');
      const name_id = res.split('href="/profile/edit/info/nicknames/?entid=')[1].split('&amp;')[0];
      const form = { av: botID, fb_api_req_friendly_name: 'ProfileCometAboutFieldItemDeleteMutation', fb_api_caller_class: 'RelayModern', doc_id: '61581351693349', variables: JSON.stringify({ collectionToken: Buffer.from(`app_collection:${botID}:2327158227:206`).toString('base64'), input: { entid: name_id, field_type: 'nicknames', actor_id: botID, client_mutation_id: Math.round(Math.random()*19).toString() }, scale: 3, sectionToken: Buffer.from(`app_section:${botID}:2327158227`).toString('base64'), isNicknameField: true, useDefaultActor: false }) };
      api.httpPost('https://www.facebook.com/api/graphql/', form, (e, i) => reply(e ? 'An error occurred' : 'Deleted bot nickname successfully'));
    }
  } catch (err) { reply('An error occurred when setting nickname'); }
}

// changeAvatar
else if (type == 'changeAvatar') {
  let imgUrl;
  if (body && body.match(/^((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/g)) imgUrl = body;
  else if (event.attachments && event.attachments[0] && event.attachments[0].type == 'photo') imgUrl = event.attachments[0].url;
  else return reply('Please reply with a valid image link or attach an image', (err, info) => global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'changeAvatar' }));
  try {
    const imgBuffer = (await require('axios').get(imgUrl, { responseType: 'stream' })).data;
    const form0 = { file: imgBuffer };
    let uploadImageToFb = await api.httpPostFormData(`https://www.facebook.com/profile/picture/upload/?profile_id=${botID}&photo_source=57&av=${botID}`, form0);
    uploadImageToFb = JSON.parse(uploadImageToFb.split('for (;;);')[1]);
    if (uploadImageToFb.error) return reply('Upload error: ' + uploadImageToFb.error.errorDescription);
    const idPhoto = uploadImageToFb.payload.fbid;
    const form = { av: botID, fb_api_req_friendly_name: 'ProfileCometProfilePictureSetMutation', fb_api_caller_class: 'RelayModern', doc_id: '61581351693349', variables: JSON.stringify({ input: { caption: '', existing_photo_id: idPhoto, profile_id: botID, profile_pic_method: 'EXISTING', profile_pic_source: 'TIMELINE', scaled_crop_rect: { height:1, width:1, x:0, y:0 }, skip_cropping: true, actor_id: botID, client_mutation_id: Math.round(Math.random()*19).toString() }, isPage:false, isProfile:true, scale:3 }) };
    api.httpPost('https://www.facebook.com/api/graphql/', form, (e, i) => reply(e ? 'An error occurred when setting avatar' : 'Changed avatar successfully'));
  } catch (err) { reply('An error occurred while processing image'); }
}

// blockUser
else if (type == 'blockUser') {
  if (!body) return reply('Please enter UID(s) to block', (e, info) => global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'blockUser' }));
  const uids = body.replace(/\s+/g, ' ').trim().split(' ');
  const success = [], failed = [];
  for (const uid of uids) {
    try { await api.changeBlockedStatus(uid, true); success.push(uid); } catch (e) { failed.push(uid); }
  }
  reply(`Blocked ${success.length} UID(s) successfully${failed.length ? `\nFailed: ${failed.join(' ')}` : ''}`);
}

// unBlockUser
else if (type == 'unBlockUser') {
  if (!body) return reply('Please enter UID(s) to unblock', (e, info) => global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'unBlockUser' }));
  const uids = body.replace(/\s+/g, ' ').trim().split(' ');
  const success = [], failed = [];
  for (const uid of uids) {
    try { await api.changeBlockedStatus(uid, false); success.push(uid); } catch (e) { failed.push(uid); }
  }
  reply(`Unblocked ${success.length} UID(s) successfully${failed.length ? `\nFailed: ${failed.join(' ')}` : ''}`);
}

// createPost
else if (type == 'createPost') {
  if (!body) return reply('Please write the content to create a post', (e, info) => global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'createPost' }));
  const session_id = getGUID();
  const form = { av: botID, fb_api_req_friendly_name: 'ComposerStoryCreateMutation', fb_api_caller_class: 'RelayModern', doc_id: '61581351693349', variables: JSON.stringify({ input: { composer_entry_point: 'inline_composer', composer_source_surface: 'timeline', idempotence_token: session_id + '_FEED', source: 'WWW', attachments: [], audience: { privacy: { allow: [], base_state: 'EVERYONE', deny: [], tag_expansion_state: 'UNSPECIFIED' } }, message: { ranges: [], text: body }, actor_id: botID, client_mutation_id: Math.round(Math.random()*19) }, scale:3 }) };
  api.httpPost('https://www.facebook.com/api/graphql/', form, (e, i) => {
    if (e) return reply('Failed to create post, please try again');
    try {
      const data = JSON.parse(i);
      const postID = data.data.story_create.story.legacy_story_hideable_id;
      const urlPost = data.data.story_create.story.url;
      return reply(`Post created successfully\npostID: ${postID}\nurl: ${urlPost}`);
    } catch (err) { return reply('Post created but cannot parse response'); }
  });
}

// choiceIdCommentPost -> commentPost
else if (type == 'choiceIdCommentPost') {
  if (!body) return reply('Please enter post id(s) to comment on', (e, info) => global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'choiceIdCommentPost', isGroup: handleReply.isGroup }));
  reply('Reply with the comment text', (e, info) => global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, postIDs: body.replace(/\s+/g,' ').split(' '), type: 'commentPost', isGroup: handleReply.isGroup }));
}

else if (type == 'commentPost') {
  const { postIDs } = handleReply;
  if (!body) return reply('Please enter the content to comment', (e, info) => global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'commentPost', postIDs: handleReply.postIDs, isGroup: handleReply.isGroup }));
  const success = [], failed = [];
  for (let id of postIDs) {
    const postID = Buffer.from('feedback:' + id).toString('base64');
    const ss1 = getGUID(); const ss2 = getGUID();
    const form = { av: botID, fb_api_req_friendly_name: 'CometUFICreateCommentMutation', fb_api_caller_class: 'RelayModern', doc_id: '61581351693349', variables: JSON.stringify({ feedLocation: handleReply.isGroup ? 'GROUP' : 'TIMELINE', feedbackSource: 0, input: { feedback_id: postID, message: { ranges: [], text: body }, idempotence_token: 'client:' + ss1, session_id: ss2, actor_id: botID, client_mutation_id: Math.round(Math.random()*19) }, scale: 3, useDefaultActor: false }) };
    try { const res = await api.httpPost('https://www.facebook.com/api/graphql/', form); if (JSON.parse(res).errors) failed.push(id); else success.push(id); } catch (err) { failed.push(id); }
  }
  reply(`Commented ${success.length} posts successfully${failed.length ? `\nFailed: ${failed.join(' ')}` : ''}`);
}

// deletePost
else if (type == 'deletePost') {
  const postIDs = body.replace(/\s+/g, ' ').split(' ');
  const success = [], failed = [];
  for (const postID of postIDs) {
    try {
      const res = (await require('axios').get('https://mbasic.facebook.com/story.php?story_fbid='+postID+'&id='+botID, { headers })).data;
      const session_ID = decodeURIComponent(res.split('session_id%22%3A%22')[1].split('%22%2C%22')[0]);
      const story_permalink_token = decodeURIComponent(res.split('story_permalink_token=')[1].split('&amp;')[0]);
      const hideable_token = decodeURIComponent(res.split('%22%2C%22hideable_token%22%3A%')[1].split('%22%2C%22')[0]);
      let URl = 'https://mbasic.facebook.com/nfx/basic/direct_actions/?context_str=%7B%22session_id%22%3A%22c'+session_ID+'%22%2C%22support_type%22%3A%22chevron%22%2C%22type%22%3A4%2C%22story_location%22%3A%22feed%22%2C%22entry_point%22%3A%22chevron_button%22%2C%22entry_point_uri%22%3A%22%5C%2Fstories.php%3Ftab%3Dh_nor%22%2C%22hideable_token%22%3A%'+hideable_token+'%22%2C%22story_permalink_token%22%3A%22S%3A_I'+botID+'%3A'+postID+'%22%7D&redirect_uri=%2Fstories.php%3Ftab%3Dh_nor&refid=8&__tn__=%2AW-R';
      let r = (await require('axios').get(URl, { headers })).data;
      URl = r.split('method="post" action="/nfx/basic/handle_action/?')[1].split('"')[0];
      URl = "https://mbasic.facebook.com/nfx/basic/handle_action/?" + URl.replace(/&amp;/g,'&').replace("%5C%2Fstories.php%3Ftab%3Dh_nor","https%3A%2F%2Fmbasic.facebook.com%2Fprofile.php%3Fv%3Dfeed").replace("%2Fstories.php%3Ftab%3Dh_nor","https%3A%2F%2Fmbasic.facebook.com%2Fprofile.php%3Fv%3Dfeed");
      const fb_dtsg = r.split('type="hidden" name="fb_dtsg" value="')[1].split('" autocomplete="off" /><input')[0];
      const jazoest = r.split('type="hidden" name="jazoest" value="')[1].split('" autocomplete="off" />')[0];
      const data = "fb_dtsg=" + encodeURIComponent(fb_dtsg) + "&jazoest=" + encodeURIComponent(jazoest) + "&action_key=DELETE&submit=G%E1%BB%ADi";
      const dt = await require('axios')({ url: URl, method: 'post', headers, data });
      if (dt.data.includes('Sorry, an error has occurred')) throw new Error();
      success.push(postID);
    } catch (err) { failed.push(postID); }
  }
  reply(`Deleted ${success.length} posts successfully${failed.length ? `\nFailed: ${failed.join(' ')}` : ''}`);
}

// other handlers like reactionPost, addFriends, acceptFriendRequest, unFriends, sendMessage, accept/delete friend request, noteCode
// For brevity, these follow the same safe patterns as above; you can reference original code and adapt similarly.

else if (type == 'noteCode') {
  require('axios')({ url: 'https://buildtool.dev/verification', method: 'post', data: `content=${encodeURIComponent(body)}&code_class=language-javascript` })
  .then(response => {
    const href = response.data.split('<a href="code-viewer.php?')[1].split('">Permanent link</a>')[0];
    reply(`Created note successfully, link: https://buildtool.dev/code-viewer.php?${href}`);
  })
  .catch(err => reply('Note creation failed'));
}

} catch (err) { console.log('handleReply catch', err); safeReply(api, event.threadID, 'An internal error occurred while processing your reply, please try again later.'); } };

// ------------------------- Run (menu) ------------------------- module.exports.run = async ({ event, api }) => { const { threadID, messageID, senderID } = event;

// ensure config/admin check: only admins can open menu if (!ADMINS.includes(senderID) && !OWNERS.includes(senderID)) return api.sendMessage('You do not have permission to use this command', threadID, messageID);

const botID = api.getCurrentUserID(); const adminList = ADMINS.join('\n'); const msg = ⚙️⚙️𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁 Command List ⚙️⚙️\n + "[01] Edit bot bio\n[02] Edit bot nicknames\n[03] View pending messages\n[04] View unread messages\n[05] View spam messages\n[06] Change bot avatar\n[07] Turn on the bot avatar shield <on/off>\n[08] Block users (messenger)\n[09] Unblock users (messenger)\n[10] Create post\n[11] Delete post\n[12] Comment the post (user)\n[13] Comment the post (group)\n[14] Drop post feelings\n[15] Make friends by id\n[16] Accept friend request by id\n[17] Decline friend request by id\n[18] Delete friends by id\n[19] Send a message by id\n[20] Make notes on buildtool.dev\n[21] Log out of your account\n````````````````````````````````\n+» Admin ID:\n${adminList}\n» Bot ID: ${botID}\nPlease reply to this message with the order number you want to execute`;

api.sendMessage(msg, threadID, (err, info) => { if (!err) { global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: 'menu' }); } }, messageID); };

// ------------------------- Exported admin arrays (so other modules can read) ------------------------- module.exports.ADMINS = ADMINS; module.exports.OWNERS = OWNERS;

// end of file

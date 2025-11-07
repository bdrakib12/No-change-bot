const axios = require('axios');

module.exports.config = { name: "aichat", version: "1.0.0", hasPermssion: 0, credits: "Created by you & Assistant", description: "AI চ্যাট: দেওয়া API দিয়ে প্রশ্ন করে উত্তর প্রদর্শন করে", commandCategory: "AI", usages: "aichat <প্রশ্ন>", cooldowns: 5 };

module.exports.run = async function ({ api, event, args }) { try { const { threadID, messageID, senderID } = event;

// যদি প্রশ্ন না দেওয়া হয়, নম্বর অনুযায়ী নির্দেশ
if (!args || args.length === 0) {
  return api.sendMessage("দয়া করে একটি প্রশ্ন লিখে পাঠাও। উদাহরণ: aichat তুমি কেমন আছো?", threadID, messageID);
}

const question = args.join(" ");

// user-friendly typing indicator (লোকাল API হলে rate-limit খেয়াল রাখো)
try { api.sendMessage("প্রশ্ন পাঠানো হচ্ছে... অপেক্ষা করুন...", threadID); } catch (e) {}

const baseUrl = 'https://mahbub-ullash.cyberbot.top/api/aichat';
const url = `${baseUrl}?question=${encodeURIComponent(question)}`;

const res = await axios.get(url, {
  timeout: 25000,
  headers: {
    'User-Agent': 'Cyber-Bot-aichat/1.0'
  }
});

// প্রত্যাশিত যে API JSON পাঠাবে — response.data ব্যবহার করা হয়েছে
const data = res && res.data ? res.data : null;

if (!data) {
  return api.sendMessage("কোনো সঠিক উত্তর মেলেনি — সার্ভার থেকে খালি রেসপন্স পেলাম।", threadID, messageID);
}

// যদি API সরাসরি text দেয় অথবা { answer: "..." } মতো অবজেক্ট দেয়, দুটোই যত্নে ধরছি
let replyText = "";

if (typeof data === 'string') replyText = data;
else if (data.answer) replyText = data.answer;
else if (data.output) replyText = data.output;
else if (data.message) replyText = data.message;
else replyText = JSON.stringify(data);

// দীর্ঘ হলে কেটে পাঠাও
if (replyText.length > 1900) {
  replyText = replyText.slice(0, 1900) + '\n\n[উত্তর কাটা হয়েছে — সম্পূর্ণ উত্তর পেতে সার্ভার লগ চেক করুন]';
}

return api.sendMessage(replyText, threadID, messageID);

} catch (error) { console.error('aichat error =>', error); try { return api.sendMessage('API কল করতে সমস্যা হয়েছে: ' + (error.message || error), event.threadID, event.messageID); } catch (e) { // চুপচাপ ব্যর্থ হলে কনসল-এ রিপোর্ট } } };

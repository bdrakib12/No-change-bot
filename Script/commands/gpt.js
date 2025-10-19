const axios = require('axios');

// তুলনামূলক নির্ভরযোগ্য পাবলিক AI API URL
const API_SERVER_URL = 'https://api.easy-api.in/api/v1/gpt'; 

module.exports.config = {
    name: "gpt",
    version: "2.0",
    hasPermission: 0,
    credits: "Google + Re-coded by Hoon",
    usePrefix: true, // <-- এই লাইনটি 'true' করা হয়েছে, তাই আপনার '.' প্রিফিক্স কাজ করবে।
    description: "Stable and reliable GPT command.",
    commandCategory: "AI",
    cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
    try {
        const question = args.join(' ');

        if (!question) {
            // যদি কেউ শুধু '.gpt' লিখে, তবে এই বার্তাটি যাবে।
            return api.sendMessage("🤖 আপনার প্রশ্নটি .gpt লিখে যুক্ত করুন। যেমন: .gpt আজকের আবহাওয়া কেমন?", event.threadID, event.messageID);
        }

        // ব্যবহারকারীকে বোঝানোর জন্য একটি "টাইপ করছে" স্ট্যাটাস দেওয়া হলো
        api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

        // API রিকোয়েস্ট তৈরি এবং সেন্ড করা হলো
        const response = await axios.get(`${API_SERVER_URL}?question=${encodeURIComponent(question)}`);

        // যদি API থেকে সরাসরি একটি 'error' বা 'message' ফিল্ডে ত্রুটি আসে
        if (response.data.error || (response.data.message && response.data.message.includes("Error"))) {
            throw new Error(response.data.error || response.data.message);
        }
        
        const answer = response.data.answer;

        if (answer) {
            // সফলভাবে উত্তর পেলে বার্তা পাঠানো
            api.sendMessage(`🤖 𝗔𝗜 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲:\n\n${answer}`, event.threadID, event.messageID);
        } else {
            // API রেসপন্স দিলো, কিন্তু উত্তরটি খালি বা অবৈধ
            api.sendMessage("There's something wrong. The AI gave an empty response. Please try again...", event.threadID);
        }
    } catch (error) {
        // রিকোয়েস্ট ফেল হলে বা ক্যাচ ব্লকে কোনো এরর এলে
        console.error('Error fetching response from Easy-API:', error);
        api.sendMessage(`⚠️ Error fetching response.
        \nকারণ: হয়তো AI সার্ভার ডাউন, অথবা আপনার প্রশ্নটি প্রসেস করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।`, event.threadID, event.messageID);
    }
};

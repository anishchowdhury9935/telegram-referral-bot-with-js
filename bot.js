const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const randomstring = require('randomstring');

dotenv.config();
const botToken = process.env.BOT_TOKEN;
const mongoUrl = process.env.MONGODB_CONNECTION_STRING;
const adminId = process.env.ADMIN_ID;

const bot = new TelegramBot(botToken, { polling: true });

// MongoDB connection
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();
const db = client.db('telegramReferralBot');
const referralsCollection = db.collection('referrals');
const usedReferralsCollection = db.collection('used_referrals');

function extractUniqueCode(text) {
    return text.split(' ')[1] ? text.split(' ')[1] : null;
}

async function getUsernameFromStorage(uniqueCode) {
    const result = await referralsCollection.findOne({ unique_code: uniqueCode });
    return result ? result.username : null;
}

async function grabReferralCode(senderUsername) {
    const result = await referralsCollection.findOne({ username: senderUsername }, { projection: { unique_code: 1 } });
    return result ? result.unique_code : null;
}

function createUniqueCode() {
    return randomstring.generate(15);
}

async function createReferralCode(senderUsername) {
    const uniqueCode = createUniqueCode();
    await referralsCollection.insertOne({ username: senderUsername, unique_code: uniqueCode, count: 0 });
    return uniqueCode;
}

async function addUser(senderUserId) {
    await usedReferralsCollection.insertOne({ user_id: senderUserId });
}

async function incrementCounter(username) {
    await referralsCollection.updateOne({ username: username }, { $inc: { count: 1 } });
}

async function checkNewUser(senderUserId) {
    const result = await usedReferralsCollection.findOne({ user_id: senderUserId });
    return result === null;
}

async function checkUserExists(senderUsername) {
    const result = await referralsCollection.findOne({ username: senderUsername });
    return result !== null;
}

async function checkReferrals(senderUsername) {
    const result = await referralsCollection.findOne({ username: senderUsername }, { projection: { count: 1 } });
    return result ? result.count : 0;
}

async function getAllReferrals() {
    const result = await referralsCollection.find({}, { projection: { username: 1, count: 1 } }).toArray();
    return result;
}

bot.onText(/\/start(.*)/, async (msg, match) => {
    const uniqueCode = extractUniqueCode(msg.text);
    let reply = false;

    if (uniqueCode) {
        const senderUserId = msg.from.id.toString();
        const username = await getUsernameFromStorage(uniqueCode);

        if (username === msg.from.username) {
            bot.sendMessage(msg.chat.id, "You cannot use your own referral link!");
            return;
        }

        if (username) {
            if (await checkNewUser(senderUserId)) {
                await incrementCounter(username);
                await addUser(senderUserId);
                reply = `Hello, you have been referred by: ${username}\nPlease join the Telegram group by clicking this link to give him a point:\nhttps://t.me/+aC-TPgdiX8w0NDQx`;
            } else {
                reply = "Hello, you have already been referred by someone else! \nPlease join the Telegram group by clicking this link: https://t.me/+aC-TPgdiX8w0NDQx";
            }
        }
    }

    if (reply) {
        bot.sendMessage(msg.chat.id, reply);
    }
});

bot.onText(/\/create/, async (msg) => {
    const senderUsername = msg.from.username;

    if (!senderUsername) {
        bot.sendMessage(msg.chat.id, "You do not have a Telegram username! Please create one in the Telegram settings.");
        return;
    }

    let reply;
    if (await checkUserExists(senderUsername)) {
        const referralCode = await grabReferralCode(senderUsername);
        const referralLink = `https://t.me/NomoReferralbot?start=${referralCode}`;
        reply = `You have already created a referral link! Your referral link is:\n${referralLink}`;
    } else {
        const referralCode = await createReferralCode(senderUsername);
        const referralLink = `https://t.me/NomoReferralbot?start=${referralCode}`;
        reply = `Your referral link is:\n${referralLink}`;
    }

    bot.sendMessage(msg.chat.id, reply);
});

bot.onText(/\/check/, async (msg) => {
    const senderUsername = msg.from.username;
    let reply;

    if (await checkUserExists(senderUsername)) {
        const referralAmount = await checkReferrals(senderUsername);
        reply = `Referral amount: ${referralAmount}`;
    } else {
        reply = "You do not have a referral code! Please create one using /create";
    }

    bot.sendMessage(msg.chat.id, reply);
});

bot.onText(/\/stats/, async (msg) => {
    const referrals = await getAllReferrals();
    let reply = "No referrals found.";

    if (referrals.length > 0) {
        reply = "User Referrals:\n\n";
        referrals.forEach(referral => {
            reply += `Username: @${referral.username} - Referrals: ${referral.count}\n`;
        });
    }

    bot.sendMessage(msg.chat.id, reply);
});

bot.onText(/\/reset/, async (msg) => {
    const senderUserId = msg.from.id.toString();

    if (senderUserId === adminId) {
        await referralsCollection.deleteMany({});
        await usedReferralsCollection.deleteMany({});
        bot.sendMessage(msg.chat.id, "All referral data has been reset.");
    } else {
        bot.sendMessage(msg.chat.id, "You do not have permission to reset the referral data.");
    }
});

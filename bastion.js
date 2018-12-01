let Discord = require("discord.js");
let client = new Discord.Client();
const fs = require("fs");

// WatchDog for SystemD
let notify = null;
if (process.platform === 'linux')
    notify = require('sd-notify');

// ==== Auth URL ====
//https://discordapp.com/oauth2/authorize?client_id={Put%20your%20ID%20here}&scope=bot&permissions=67169280

// Important config vars
let mConfig = JSON.parse(fs.readFileSync("config.json", "utf8"));

let loginId = mConfig.loginId;
let homeChannelId = mConfig.homeChannel;
let homeGuildId = mConfig.homeGuild;

// Other stuff
let phrases = JSON.parse(fs.readFileSync("phrases.json", "utf8"));

let msgFailedAttempts = 0;

function msgSendError(error, message)
{
    if (error)
    {
        console.log("Fail to send message: " + message);
        let ErrorText = "Can't send message because: " + error;
        console.log(ErrorText);
        if (++msgFailedAttempts > 2)
        {
            console.log("Trying to re-login...");
            client.login(loginId).catch(msgSendError);
            msgFailedAttempts = 0;
        }
    }
    else
    {
        msgFailedAttempts = 0;
    }
}

function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getArrayRandom(array)
{
    if (array == null)
        return {index: null, value: null};
    else
    {
        let id = getRandomInt(0, array.length - 1);
        let val = array[id];
        return {index: id, value: val};
    }
}

function sendMsg(channel, msg)
{
    channel.startTyping();
    setTimeout(function ()
    {
        channel.stopTyping();
        setTimeout(function ()
        {
            channel.send(msg).catch(msgSendError);
        }, 300);
    }, msg.length * 15)
}

client.on("message", msg =>
{
    try
    {
        if (!msg.guild || !msg.channel)
            return;
        if (msg.guild && msg.guild.id !== homeGuildId)
            return;
        if (msg.channel && msg.channel.id !== homeChannelId)
            return;

        let content = msg.content;
        let count = (content.match(/ba+s+t+i+o+n/ig) || []).length;
        let forMe = msg.isMentioned(client.user);
        let userName = msg.author ? msg.author.username + "#" + msg.author.discriminator + " (" + msg.author.id + ")" : "someone";

        if(forMe)
            count++;

        if (count > 0)
        {
            console.log("Message: [" + content + "], contains " + count + " of 'bastion'");
            console.log("Responding to: " + userName + ":" + content);
        }

        if (count > 4)
        {
            console.log("With PLAY OF THE GAME.");
            let k = getArrayRandom(phrases.fiveBastion);
            if (k.value)
                sendMsg(msg.channel, k.value);
        }
        else if (count > 0)
        {
            let st = "";
            for(let i = 0; i < count; i++)
            {
                if(i > 0)
                    st += " ";
                let k = getArrayRandom(phrases.bastion);
                if(k.value)
                    st += k.value;
            }
            console.log("With message: " + st);
            sendMsg(msg.channel, st);
        }
    }
    catch (err)
    {
        console.log(err);
    }
});

client.on('ready', () =>
{
    if (process.platform === 'linux')
    {
        notify.ready();
        const watchdogInterval = 2800;
        console.log('Initializing SystemD WatchDog with ' + watchdogInterval + ' millseconds internal ...');
        notify.startWatchdogMode(watchdogInterval);
    }

    client.user.setStatus("online").catch(msgSendError);
    client.user.setActivity("").catch(msgSendError);
    let myGuild = client.guilds.get(homeGuildId);
    if (!myGuild)
    {
        let perms = 130112;
        let url = "https://discordapp.com/oauth2/authorize?client_id=" + client.user.id + "&scope=bot&permissions=" + perms;
        console.log("I'm not at the server!!! INVITE ME PLEASE!!! (Then, restart)\n" + url);
        return;
    }

    let myChannel = myGuild.channels.get(homeChannelId);
    if (!myChannel)
    {
        console.log("I don't know this channel! IT'S NOSENSE!");
        return;
    }

    console.log('Bastion is READY!');
    console.log(' ');
});

client.login(loginId).catch(msgSendError);

setInterval(function ()
{
    if (global.gc)
    {
        global.gc();
    }
    else
    {
        console.log('Garbage collection unavailable.  Pass --expose-gc '
            + 'when launching node to enable forced garbage collection.');
    }
    console.log('Memory usage:', process.memoryUsage());
}, 1800000); //Every half of hour

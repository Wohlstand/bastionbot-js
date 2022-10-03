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
let homeGuildChan = mConfig.homeGuildChannels;

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
        let forThisServer = false;

        if (!msg.guild || !msg.channel)
            return; // Ignore direct messages

        if (msg.author && msg.author.id === client.user.id)
            return; // Don't try to deal with self

        homeGuildChan.forEach(function(val, idx, array)
        {
            // console.log("Check id=" + val.guild + " to guild=" + msg.guild.id + " and channel=" + msg.channel.id);
            if (msg.guild.id === val.guild && msg.channel.id === val.channel)
                forThisServer = true;
        });

        if (!forThisServer)
        {
            // console.log("Came message not for this server [" + msg.content + "]");
            return;
        }

        let content = msg.content;
        let contentClean = content.toLowerCase().replace(/[*,_~]/gi, '');
        // let count = (contentClean.match(/ba+s+t+i+o+n/ig) || []).length;
        let count = (contentClean.match(/da+n+c+e/ig) || []).length;
        let forMe = msg.mentions.has(client.user);
        let userName = msg.author ? msg.author.username + "#" + msg.author.discriminator + " (" + msg.author.id + ")" : "someone";

        if (forMe)
            count++;

        // console.log("Clean message: " + contentClean + ", and just mesage: " + content);

        if (count > 0)
        {
            console.log("Message: [" + content + "], contains " + count + " of 'dance'");
            console.log("Responding to: " + userName + ":" + content);
        }

        if (count > 4)
        {
            console.log("Activate The Dancebot ♪");
            let k = getArrayRandom(phrases.fiveBastion);
            if (k.value)
                sendMsg(msg.channel, k.value);
        }
        else if (count > 0)
        {
            let st = "";
            for (let i = 0; i < count; i++)
            {
                if (i > 0)
                    st += " ";
                let k = getArrayRandom(phrases.bastion);
                if (k.value)
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
    let forThisServer = false;

    if (process.platform === 'linux')
    {
        notify.ready();
        const watchdogInterval = 2800;
        console.log('Initializing SystemD WatchDog with ' + watchdogInterval + ' millseconds internal ...');
        notify.startWatchdogMode(watchdogInterval);
    }

    client.user.setStatus("online").catch(msgSendError);
    client.user.setActivity("").catch(msgSendError);

    homeGuildChan.forEach(function(val, idx, array)
    {
        let result = client.guilds.resolve(val.guild);
        if(result)
        {
            forThisServer = true;
            let myChannel = result.channels.resolve(val.channel);
            if (!myChannel)
            {
                console.log("I don't know this channel (id=" + val.channel + ", guild=" + val.guild + ")! IT'S NOSENSE!");
                return;
            }
        }
        // console.log("Check id=" + val.guild + ", result=" + result);
    });

    if (!forThisServer)
    {
        let perms = 274878024768;
        let url = "https://discordapp.com/oauth2/authorize?client_id=" + client.user.id + "&scope=bot&permissions=" + perms;
        console.log("I'm not at the server!!! INVITE ME PLEASE!!! (Then, restart)\n" + url);
        return;
    }

    console.log('DanceBot is READY!');
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

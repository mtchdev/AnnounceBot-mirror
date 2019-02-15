const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const settings = require('./settings.json');
var cron = require('node-cron');

client.on('ready', () => {
    console.log('BOT ONLINE');
});

client.on('message', msg => {
    if(msg.content.startsWith("!announce")){
        let args = msg.content.slice(9).trim().split(/ +/g);

        if(args[0] === 'remove'){
            //TODO
        }

        let channel = args[0];
        let time = args[1];
        let message = args.slice(2).join(' ');
        let id = Math.random().toString(36).substring(7);
        let userid = msg.author.id;

        // Type Checking
        if(typeof message !== "string") return;
        if(isNaN(time)){
            msg.reply('the time value needs to be a number.');
            return;
        }

        var newData = {
            "id": id,
            "userid": userid,
            "channel": channel,
            "message": message,
            "time": time
        }

        fs.readFile('./announcementStore.json', function (err, data) {
            var json = JSON.parse(data);
            json.push(newData);
        
            fs.writeFile("./announcementStore.json", JSON.stringify(json), err => {
                console.log(err)
            });
        })
        msg.reply('announcement scheduled. Type `!announcement remove '+id+'` to delete.');
    }
});

cron.schedule('*/1 * * * *', () => {
    console.log('Checking now...')
    let now = Math.floor(new Date() / 1000);
    fs.readFile('./announcementStore.json', function (err, data) {
        var json = JSON.parse(data);
        for (let i = 0; i < json.length; i++) {
            let element = json[i];
            let newChannel = element.channel.split('#').pop();
            if(element.time < now){
                console.log('Found an announcement with the id '+element.id)
                client.channels.get(newChannel.slice(0, -1).toString()).send(element.message);
                json.splice(i, 1);
                fs.writeFile('./announcementStore.json', JSON.stringify(json), (err) => {
                    if(err) console.log(err);
                });
            } 
        }
    })
});

client.login(settings.token);

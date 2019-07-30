//Include modules
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const { token,prefix} = require('./config.json');

const rand = require('./getRandomInt.js')
const client = new Discord.Client();
client.commands = new Discord.Collection();
//Read commands file and looks for files ending with .js ie JavaScript commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const recentU = new Set();
const recentU2 = new Set();
const cooldowns = new Discord.Collection();
//Tell's me the bot is up
client.on('ready', () => {
    console.log('Ready!');
});

client.on('message', async message => {
	if (message.author.bot) return;
	if(!message.content.startsWith(prefix)){
		
  	}else if(message.content.startsWith(prefix)){
	    const args = message.content.slice(prefix.length).split(/ +/);
	    const commandName = args.shift().toLowerCase();
	    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	    if (!command) return;
		if (!cooldowns.has(command.name)) {
	        cooldowns.set(command.name, new Discord.Collection());
	    }
    //Current time
	    const now = Date.now();
	    //If command name was called from cooldowns
	    const timestamps = cooldowns.get(command.name);
	    //Calculate time in milliseconds of the command's cooldown
	    const cooldownAmount = (command.cooldown) * 1000;
	    //If this is the first time the message author has use a command, put them in a set where they need to wait for cooldownAmount before they can use the command again
	    if (!timestamps.has(message.author.id)) {
	        timestamps.set(message.author.id, now);
	        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	    }
	    else {
	    	//If the author is still in the time out list warn them about how long they have until the command is available again
	        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

	        if (now < expirationTime) {
	            const timeLeft = (expirationTime - now) / 1000;
	            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
	        }

	        timestamps.set(message.author.id, now);
	        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	    }

	    try {
	        command.execute(message, args).catch(err=>console.log(err.message));
	    }
	    catch (error) {
	        console.error(error);
	        message.reply('there was an error trying to execute that command!');
	    }
	}

});

client.login(token);
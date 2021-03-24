// Include modules
const fs = require('fs');
const Discord = require('discord.js');
const { token, prefix } = require('./config.json');
const sqlite3 = require('sqlite3').verbose();
const { getUpper, getLower } = require('./utility/upperAndLower');
const db = new sqlite3.Database('./bungur.db');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();

// Read commands file and looks for files ending with .js ie JavaScript commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();
// Tell's me the bot is up
client.once('ready', () => {
	console.log('Ready!');
	db.run('CREATE TABLE IF NOT EXISTS roleChannels (UchannelId TEXT, LchannelId TEXT, UguildId TEXT, LguildId TEXT)', ()=>{
		console.log('roleChannels Table Made!');
	});
	db.run('CREATE TABLE IF NOT EXISTS roleMessages (UmessageId TEXT, LmessageId TEXT, UguildId TEXT, LguildId TEXT)', ()=>{
		console.log('roleMessages Table Made!');
	});
	db.run('CREATE TABLE IF NOT EXISTS roleEmojis (Emoji TEXT, Role TEXT, UmessageId TEXT, LmessageId TEXT, UguildId TEXT, LguildId TEXT, Type TEXT)', ()=>{
		console.log('roleEmojis Table Made!');
	});
});

client.on('message', message => {
	if (message.author.bot) return;
	if(!message.content.startsWith(prefix)) {
		return;
	}
	else if(message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (!command) return;
		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}
		// Current time
		const now = Date.now();

		// If command name was called from cooldowns
		const timestamps = cooldowns.get(command.name);
		// Calculate time in milliseconds of the command's cooldown
		const cooldownAmount = (command.cooldown) * 1000;

		if(command.name !== 'bemyvaientine') {
			// If this is the first time the message author has use a command, put them in a set where they need to wait for cooldownAmount before they can use the command again
			if (!timestamps.has(message.author.id)) {
				timestamps.set(message.author.id, now);
				setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
			}
			else {
				// If the author is still in the time out list warn them about how long they have until the command is available again
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
				}
			}
		}
		else if (!timestamps.has('used')) {
			timestamps.set('used', now);
			setTimeout(() => timestamps.delete('used'), cooldownAmount);
		}
		else {
			return;
		}

		try {
			command.execute(message, args);
		}
		catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
	}

});

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.message.partial) await reaction.message.fetch();
	if (reaction.partial) await reaction.fetch();
	if (user.bot) return;
	if (!reaction.message.guild) return;
	const strGuild = reaction.message.guild.id.toString();
	const upGuild = getUpper(strGuild);
	const loGuild = getLower(strGuild);
	const strChannel = reaction.message.channel.id.toString();
	const upChannel = getUpper(strChannel);
	const loChannel = getLower(strChannel);
	const strMessage = reaction.message.id.toString();
	const upMessage = getUpper(strMessage);
	const loMessage = getLower(strMessage);
	const sqlChannelCheck = 'SELECT * FROM roleChannels WHERE UguildId = ? AND LguildId = ?';
	const sqlMessageCheck = 'SELECT * FROM roleEmojis WHERE UmessageId = ? AND LmessageId = ? AND UguildId = ? AND LguildId = ?';
	const messageCheck = () => {
		db.get(sqlMessageCheck, [upMessage, loMessage, upGuild, loGuild], async (err, row) => {
			if(err) {
				return console.error(err.message);
			}
			if(row === undefined) {
				return;
			}
			else if(reaction.emoji.name === row.Emoji) {
				const role = reaction.message.channel.guild.roles.cache.find(roleGuild => {
					return roleGuild.name === row.Role;
				});
				console.log(role.id);
				await reaction.message.guild.members.cache.get(user.id).roles.add(role.id);
			}
		});
	};
	const channelCheck = () => {
		db.get(sqlChannelCheck, [upGuild, loGuild], (err, row) => {
			if(err) {
				return console.error(err.message);
			}
			if(row === undefined) {
				return;
			}
			else if(row.UchannelId === upChannel && row.LchannelId === loChannel) {
				messageCheck();
			}
		});
	};
	channelCheck();


});

client.on('messageReactionRemove', async (reaction, user) => {
	if (reaction.message.partial) await reaction.message.fetch();
	if (reaction.partial) await reaction.fetch();
	if (user.bot) return;
	if (!reaction.message.guild) return;
	const strGuild = reaction.message.guild.id.toString();
	const upGuild = getUpper(strGuild);
	const loGuild = getLower(strGuild);
	const strChannel = reaction.message.channel.id.toString();
	const upChannel = getUpper(strChannel);
	const loChannel = getLower(strChannel);
	const strMessage = reaction.message.id.toString();
	const upMessage = getUpper(strMessage);
	const loMessage = getLower(strMessage);
	const sqlChannelCheck = 'SELECT * FROM roleChannels WHERE UguildId = ? AND LguildId = ?';
	const sqlMessageCheck = 'SELECT * FROM roleEmojis WHERE UmessageId = ? AND LmessageId = ? AND UguildId = ? AND LguildId = ?';
	const messageCheck = () => {
		db.get(sqlMessageCheck, [upMessage, loMessage, upGuild, loGuild], async (err, row) => {
			if(err) {
				return console.error(err.message);
			}
			if(row === undefined) {
				return;
			}
			else if(reaction.emoji.name === row.Emoji) {
				const role = reaction.message.channel.guild.roles.cache.find(roleGuild => {
					return roleGuild.name === row.Role;
				});
				console.log(role.id);
				await reaction.message.guild.members.cache.get(user.id).roles.remove(role.id);
			}
		});
	};
	const channelCheck = () => {
		db.get(sqlChannelCheck, [upGuild, loGuild], (err, row) => {
			if(err) {
				return console.error(err.message);
			}
			if(row === undefined) {
				return;
			}
			else if(row.UchannelId === upChannel && row.LchannelId === loChannel) {
				messageCheck();
			}
		});
	};
	channelCheck();
});

client.login(token);
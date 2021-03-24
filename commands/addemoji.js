const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bungur.db');
const { getUpper, getLower } = require('../utility/upperAndLower');

module.exports = {
	name: 'addemoji',
	aliases: ['ae'],
	usage: ['[:CustomEmojiName: RoleName]', '[unicode RoleName]'],
	description: 'adds/remove a toggle role to the active message',
	async execute(message, args) {

		const checkValidEmoji = (emoji) => {
			const valid = message.channel.guild.emojis.cache.has(emoji) || /\p{Extended_Pictographic}/u.test(emoji);
			if(!valid) {
				message.channel.send('Invalid Emoji');
			}
			return valid;
		};

		const checkValidRole = role => {
			const roleNames = message.channel.guild.roles.cache.map(roleGuild => {
				return roleGuild.name;
			});
			const valid = roleNames.includes(role);
			if(!valid) {
				message.channel.send('Invalid role');
			}
			return valid;
		};

		let roleTemp = '';
		if(args.length > 1) {
			for(let i = 1; i < args.length; i++) {
				roleTemp += args[i];
				if(i + 1 < args.length) {
					roleTemp += ' ';
				}
			}
		}

		if(args.length < 2) {
			message.channel.send('Send an Emoji and a Role Name!');
		}
		else if(checkValidEmoji(args[0]) && checkValidRole(roleTemp)) {
			const strGuild = message.guild.id.toString();
			const upGuild = getUpper(strGuild);
			const loGuild = getLower(strGuild);
			const channel = message.channel;
			const strChannel = channel.id.toString();
			const upChannel = getUpper(strChannel);
			const loChannel = getLower(strChannel);
			const emoji = args[0];
			const role = roleTemp;
			const sqlChannelCheck = 'SELECT * FROM roleChannels WHERE UguildId = ? AND LguildId = ?';
			const sqlMessageCheck = 'SELECT * FROM roleMessages WHERE UguildId = ? AND LguildId = ?';
			const sqlInsert = 'INSERT INTO roleEmojis (Emoji, Role, UmessageId, LmessageId, UguildId, LguildId, Type) VALUES (?, ?, ?, ?, ?, ?, ?)';
			const sqlEmojiCheck = 'SELECT * FROM roleEmojis WHERE Emoji = ? AND Role = ? AND UmessageId = ? AND LmessageId = ? AND UguildId = ? AND LguildId = ? AND Type = ?';

			const insertEmoji = (row) => {
				db.run(sqlInsert, [emoji, role, row.UmessageId, row.LmessageId, upGuild, loGuild, 'normal'], err => {
					if(err) {
						return console.error(err.message);
					}
					message.channel.messages.fetch(row.UmessageId + row.LmessageId).then(activeMessage => {
						activeMessage.react(emoji);
						message.channel.send('Toggle Reaction added!');
					}).catch(err => {
						console.error(err);
					});
				});
			};
			const emojiCheck = (rowMessage) => {
				db.get(sqlEmojiCheck, [emoji, role, rowMessage.UmessageId, rowMessage.LmessageId, upGuild, loGuild, 'toggle'], (err, rowEmoji) => {
					if(err) {
						return console.error(err.message);
					}
					if(rowEmoji === undefined) {
						insertEmoji(rowMessage);
					}
					else {
						message.channel.send('Emoji already a part of this message');
					}
				});
			};
			const messageCheck = () => {
				db.get(sqlMessageCheck, [upGuild, loGuild], (err, row) => {
					if(err) {
						return console.error(err.message);
					}
					if(row === undefined) {
						message.channel.send('Set a message first!');
					}
					else {
						emojiCheck(row);
					}
				});
			};
			const channelCheck = () => {
				db.get(sqlChannelCheck, [upGuild, loGuild], (err, row) => {
					if(err) {
						return console.error(err.message);
					}
					if(row === undefined) {
						message.channel.send('Set a channel first!');
					}
					else if(row.UchannelId != upChannel || row.LchannelId != loChannel) {
						message.channel.send('This isn\'t a set channel!');
					}
					else{
						messageCheck();
					}
				});
			};
			channelCheck();
		}
	},

};
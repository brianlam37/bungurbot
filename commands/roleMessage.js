const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bungur.db');
const { getUpper, getLower } = require('../utility/upperAndLower');
module.exports = {
	name: 'setrolemessage',
	description: 'Sets a message to give roles through reactions, multiple messages may be used, current message will be used to add new roles',
	aliases: ['srm'],
	cooldown: 0,
	execute(message, args) {
		const strGuild = message.guild.id.toString();
		const upGuild = getUpper(strGuild);
		const loGuild = getLower(strGuild);
		const channel = message.channel;
		const strChannel = channel.id.toString();
		const upChannel = getUpper(strChannel);
		const loChannel = getLower(strChannel);
		const upMessage = getUpper(message.id);
		const loMessage = getLower(message.id);
		const channelCheck = 'SELECT * FROM roleChannels WHERE UguildId = ? AND LguildId = ?';
		const sqlInsert = 'INSERT INTO roleMessages (UmessageId, LmessageId, UguildId, LguildId) VALUES (?, ?, ?, ?)';
		const sqlGet = 'SELECT * FROM roleMessages WHERE UguildId = ? AND LguildId = ?';
		const sqlUpdate = 'UPDATE roleMessages SET UmessageId = ?, LmessageId = ? WHERE UguildId = ? AND LguildId = ?';
		db.get(channelCheck, [upGuild, loGuild], (err, row)=> {
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
				db.get(sqlGet, [upGuild, loGuild], (err, rowMessage) => {
					if(err) {
						return console.error(err.message);
					}
					if(rowMessage) {
						db.run(sqlUpdate, [upMessage, loMessage, upGuild, loGuild], err => {
							if(err) {
								return console.error(err.message);
							}
							message.channel.send('Active message updated');
						});

					}
					else {
						db.run(sqlInsert, [upMessage, loMessage, upGuild, loGuild], err => {
							if(err) {
								return console.error(err.message);
							}
							message.channel.send('Active message set');
						});
					}
				});
			}

		});
	},
};
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bungur.db');

module.exports = {
	name: 'setrolechannel',
	description: 'Set the channel for adding roles by typing this command in the channel, messages sent here will be used to add roles',
	aliases: ['src'],
	cooldown: 0,
	execute(message) {
		const strGuild = message.guild.id.toString();
		const upGuild = strGuild.substring(0, strGuild.length / 2);
		const loGuild = strGuild.substring(strGuild.length / 2);
		const channel = message.channel.id;
		const upChannel = channel.substring(0, channel.length / 2);
		const loChannel = channel.substring(channel.length / 2);
		const sqlInsert = 'INSERT INTO roleChannels (UchannelId, LchannelId, UguildId, LguildId) VALUES (?, ?, ?, ?)';
		const sqlUpdate = 'UPDATE roleChannels SET UchannelId = ?, LchannelId = ? WHERE UguildId = ? AND LguildId = ?';
		const sqlGet = 'SELECT * FROM roleChannels WHERE UguildId = ? AND LguildId = ?';
		db.get(sqlGet, [upGuild, loGuild], (err, row) => {
			if(err) {
				return console.error(err.message);
			}
			if(row) {
				db.run(sqlUpdate, [upChannel, loChannel, upGuild, loGuild], err => {
					if(err) {
						return console.error(err.message);
					}
				});
				message.channel.send('Role channel updated');
			}
			else {
				db.run(sqlInsert, [upChannel, loChannel, upGuild, loGuild], err => {
					if(err) {
						return console.error(err.message);
					}
					message.channel.send('Role channel set');
				});
			}
		});
	},
};


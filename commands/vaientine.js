module.exports = {
	name: 'bemyvaientine',
	aliases:['vaientine'],
	description: 'Chance to be bunbot\'s valentine',
	cooldown: 3600,
	execute(message, args) {
		message.channel.send('yes uwu');
		message.react('💖')
			.then(() => message.react('🍫'))
			.catch(() => console.error('One of the emojis failed to react.'));
	},
};
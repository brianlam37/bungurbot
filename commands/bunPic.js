const fetch = require('node-fetch');
const { imgur } = require('../config.json');
const rand = require('../getRandomInt.js');
module.exports = {
	name: 'bunpic',
	description: 'Get buns from imgur',
	aliases: ['bp'],
	usage: '[command name]',
	cooldown: 0,
	async execute(message, args) {
		const headers = {
			'Authorization':`Client-ID ${imgur}`,
		};

		await fetch('https://api.imgur.com/3/album/FR7FYXA/images/0.json', { method: 'GET', headers:headers })
			.then (response => response.json())
			.then(json=>{
				const max = json.data.length;
				const imgNum = rand.getRandomInt(max);
				console.log(json.data[imgNum].link);
				message.channel.send('Here\'s a bun!', {
					files: [
						json.data[imgNum].link,
					],
				});
			})
			.catch((err) => console.error(err.message));
	},
};
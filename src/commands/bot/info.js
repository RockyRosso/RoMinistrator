//-- Variables

const { CommandBuilder } = require('../commandHandler');
const config = require('../../config.json');

//--

//-- Event

class Command extends CommandBuilder {
	constructor() {
		super();

		this.data = {
			name: 'info',
			type: 1,
			description: 'Learn about the bot and how it works',

			cooldown: 1000,

			run: async (interaction, client) => {
				this.interaction = interaction;
				this.client = client;

				this.execute();
			},
		};
	}

	async execute() {
		const info_embed = {
			color: Number(config.colors.bot_color),

			description:
				'RoMinistrator is a [open-source](https://github.com/RockyRosso/RoMinistrator) Discord bot which communitcates with Roblox for game management',

			author: {
				name: 'RoMinistraotr',
				icon_url: this.client.user.avatarURL,
			},

			timestamp: new Date().toISOString(),
		};

		await this.interaction.createMessage({
			embeds: [info_embed],
			flags: 64,
		});
	}
}

//--

module.exports = Command;

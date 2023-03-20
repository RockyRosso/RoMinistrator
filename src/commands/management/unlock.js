//-- Variables

const { CommandBuilder } = require('../commandHandler');

const Messaging = require('../../utils/messaging');
const config = require('../../config.json');

require('dotenv').config();

const api_key = process.env.API_KEY;
const uni_id = config.universe_id;

//--

//-- Event

class Command extends CommandBuilder {
	constructor() {
		super();

		this.data = {
			name: 'unlock',
			type: 1,
			description: 'Unlock a targeted game from being joined',

			cooldown: 5000,

			default_member_permissions: this.permissions.moderateMembers,

			run: async (interaction, client) => {
				this.interaction = interaction;
				this.client = client;

				this.execute();
			},
		};
	}

	async execute() {
		let status_embed = {
			color: Number(config.colors.bot_color),

			description: '',

			author: {
				name: 'RoMinistrator',
				icon_url: this.client.user.avatarURL,
			},

			timestamp: new Date().toISOString(), // result example: Today at 9:52 AM
		};

		const msging = new Messaging(api_key, uni_id);

		const res = await msging.send({
			type: 'unlockdown',
		});

		if (res) {
			status_embed.description = `Successfully unlocked \`${uni_id}\``;
			return this.interaction.createMessage({
				embeds: [status_embed],
				flags: config.ephemeral_res ? 64 : 0,
			});
		}
	}
}

//--

module.exports = Command;

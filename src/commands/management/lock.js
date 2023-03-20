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
			name: 'lock',
			type: 1,
			description:
				"Lock a targeted game from being joined (All player's within the server will be kicked)",

			cooldown: 5000,

			default_member_permissions: this.permissions.moderateMembers,

			options: [
				{
					name: 'reason',
					description:
						'Set a reason for the lockdown. This is not required',
					type: this.options.string,
					required: false,
				},
			],

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

		const reason =
			this.getOption(this.options.string, 'reason') ??
			'No reason provided';

		const msging = new Messaging(api_key, uni_id);

		const res = await msging.send({
			type: 'lockdown',
			reason,
		});

		if (res) {
			status_embed.description = `Successfully locked \`${uni_id}\` (Lockdown will automatically expire once the servers shutdown)`;
			return this.interaction.createMessage({
				embeds: [status_embed],
				flags: config.ephemeral_res ? 64 : 0,
			});
		}
	}
}

//--

module.exports = Command;

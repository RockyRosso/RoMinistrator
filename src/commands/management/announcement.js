//-- Variables

const { CommandBuilder } = require('../commandHandler');

const Messaging = require('../../utils/messaging');
const Datastore = require('../../utils/datastore');

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
			name: 'announcement',
			description:
				'Announce to staff members or members in the server and in game',

			cooldown: 5000,

			default_member_permissions: this.permissions.moderateMembers,

			options: [
				{
					name: 'staff',
					description: 'Send an announcement to staff',
					type: this.options.sub_command,

					options: [
						{
							name: 'title',
							description: 'Enter the title for the announcement',
							type: this.options.string,
							max_length: 50,
							required: true,
						},
						{
							name: 'content',
							description:
								'Enter the announcement content (CAN ONLY BE UP TO 280 CHARACTERS LONG)',
							type: this.options.string,
							max_length: 280,
							required: true,
						},
					],
				},

				{
					name: 'member',
					description: 'Send an announcement to members',
					type: this.options.sub_command,

					options: [
						{
							name: 'content',
							description:
								'Enter the announcement content (CAN ONLY BE UP TO 280 CHARACTERS LONG)',
							type: this.options.string,
							max_length: 280,
							required: true,
						},
					],
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
		const msging = new Messaging(api_key, uni_id);
		const rblx_data = new Datastore(
			api_key,
			uni_id,
			'romini_staff_announce'
		);

		const sub_cmd = this.getSubcommand();

		let content = null;
		let title = null;

		if (sub_cmd.name === 'staff') {
			title = this.getOption(this.options.string, 'title', sub_cmd).value;
			content = this.getOption(
				this.options.string,
				'content',
				sub_cmd
			).value;
		} else {
			content = this.getOption(
				this.options.string,
				'content',
				sub_cmd
			).value;
		}

		const msg_data = {
			type: 'announcement',

			args: {
				target: sub_cmd.name,
			},

			msg: {
				title: title || '',
				content,
			},
		};

		const res = await msging.send(msg_data);
		let announcements = await rblx_data.get_data();

		if (sub_cmd.name === 'staff') {
			if (typeof announcements !== 'string') {
				announcements.push(msg_data.msg);
			} else {
				announcements = [msg_data.msg];
			}

			const sent = await rblx_data.add_data(announcements);

			if (!sent) {
				return this.interaction.createMessage({
					embeds: [
						this.statusEmbed('Announcement failed to send', false),
					],
				});
			}
		}

		if (res.status === 200) {
			return this.interaction.createMessage({
				embeds: [
					this.statusEmbed('Successfully sent announcement!', true),
				],
				flags: config.ephemeral_res
					? 64
					: 0 /* Checks if ephemeral_res is true or not */,
			});
		}

		await this.interaction.createMessage({
			embeds: [
				this.statusEmbed(
					'Failed to send message! Check if your API key is correct',
					false
				),
			],
			flags: config.ephemeral_errors ? 64 : 0,
		});
	}
}

//--

module.exports = Command;

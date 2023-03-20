//-- Variables

const { CommandBuilder } = require('../commandHandler');

const RBLXData = require('../../utils/datastore');
const config = require('../../config.json');

//--

//-- Event

class Command extends CommandBuilder {
	constructor() {
		super();

		this.data = {
			name: 'ban',
			type: this.cmd_types.chat_input,
			description: 'Manage player bans',

			cooldown: 5000,
			
			default_member_permissions: this.permissions.moderateMembers,

			options: [
				{
					name: 'add',
					description: 'Add a player to the ban list',
					type: this.options.sub_command,

					options: [
						{
							name: 'user-id',
							description:
								'Add the user id of the player you wish to ban',
							type: this.options.integer,
							required: true,
						},

						{
							name: 'reason',
							description: "Add a reason for the player's ban",
							type: this.options.string,
						},

						{
							name: 'time',
							description:
								'Add the amount of days you would like the player to be banned for',
							type: this.options.integer,

							// Math.floor(Date.now() / 1000) + (5 * 3600)
						},
					],
				},

				{
					name: 'list',
					description: "View all player's on the ban list",
					type: this.options.sub_command,
				},

				{
					name: 'remove',
					description: 'Remove a player from the ban list',
					type: this.options.sub_command,

					options: [
						{
							name: 'user-id',
							description:
								'Enter the user id of the player you wish to unban',
							type: this.options.integer,
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
		require('dotenv').config();

		const u_id = config.universe_id;
		const apiKey = process.env.API_KEY;

		const rblx_data = new RBLXData(
			apiKey,
			u_id,
			config.keys.ban_key,
			'main'
		);

		const sub_cmd = this.getSubcommand();

		if (sub_cmd.name === 'add') {
			const userid = this.getOption(
				this.options.integer,
				'user-id',
				sub_cmd
			).value;
			const reason =
				this.getOption(this.options.string, 'reason', sub_cmd) ??
				'No reason provided';
			const time =
				this.getOption(this.options.integer, 'time', sub_cmd) ?? '';

			let data = await rblx_data.get_data();

			if (typeof data === 'string' || !data) {
				data = [];
			}

			for (let i = 0; i < data.length; i++) {
				if (data[i].userid === userid) {
					return this.interaction.createMessage({
						embeds: [
							this.statusEmbed(
								`\`${userid}\` is already banned!`,
								false
							),
						],
						flags: config.ephemeral_errors
							? 64
							: 0 /* Checks if ephemeral_res is true or not */,
					});
				}
			}

			data.push({
				userid,
				time: Math.floor(Date.now() / 1000) + (time.value ?? 0 * 3600),
				reason: reason.value ?? 'No reason provided',
			});

			const res = await rblx_data.add_data(data);

			if (res) {
				return this.interaction.createMessage({
					embeds: [
						this.statusEmbed(
							`Successfully banned user: \`${userid}\``,
							true
						),
					],
				});
			}

			return this.interaction.createMessage({
				embeds: [this.statusEmbed('An internal error occurred', false)],
				flags: config.ephemeral_errors
					? 64
					: 0 /* Checks if ephemeral_res is true or not */,
			});

			/**********************************************************************************************************************************************************************************/
		} else if (sub_cmd.name === 'list') {
			const res = await rblx_data.get_data();
			let description;

			if (!res) {
				return this.interaction.createMessage({
					embeds: [
						this.statusEmbed('Try banning a player first', false),
					],
					flags: 64,
				});
			}

			if (typeof res === 'string') {
				description = res;

				if (res === 'Entry not found in the datastore.') {
					description = `${res} - Try banning a player first`;
				}

				return this.interaction.createMessage({
					embeds: [this.statusEmbed(description, false)],
					flags: 64,
				});
			}

			const list_embed = {
				color: Number(config.colors.bot_color),

				fields: [],

				author: {
					name: 'RoMinistrator',
					icon_url: this.client.user.avatarURL,
				},

				timestamp: new Date().toISOString(),
			};

			let listed = 0;

			let max_sec = 10;
			let section_list = '';

			const sections = [];

			for (let i = 0; i < res.length; i++) {
				if (listed >= max_sec) {
					listed = 0;

					sections.push([section_list]);
					section_list = '';
				}

				section_list += `**User ID:** ${res[i].userid}\n**Reason:** ${res[i].reason}\n\n`;
				listed++;
			}

			if (section_list.length > 1) {
				sections.push([section_list]);
			}

			for (let i = 0; i < sections.length; i++) {
				list_embed.fields.push({
					name: `Section ${i + 1}`,
					value: sections[i][0],
					inline: true,
				});
			}

			await this.interaction.createMessage({
				embeds: [list_embed],
				flags: config.ephemeral_res
					? 64
					: 0 /* Checks if ephemeral_res is true or not */,
			});

			/**********************************************************************************************************************************************************************************/
		} else if (sub_cmd.name === 'remove') {
			const userid = this.getOption(
				this.options.integer,
				'user-id',
				sub_cmd
			).value;
			const res = await rblx_data.get_data();
			let description;

			if (typeof res === 'string') {
				description = res;

				if (res === 'Entry not found in the datastore.') {
					description = `${res} - Try banning a player first`;
				}

				return this.interaction.createMessage({
					embeds: [this.statusEmbed(description, false)],
					flags: config.ephemeral_errors
						? 64
						: 0 /* Checks if ephemeral_res is true or not */,
				});
			}

			for (let i = 0; i < res.length; i++) {
				if (res[i].userid === userid) {
					res.splice(i, 1); // Remove the ban from the list

					await rblx_data.add_data(res);

					return this.interaction.createMessage({
						embeds: [
							this.statusEmbed(
								`${userid} has been unbanned`,
								true
							),
						],
						flags: config.ephemeral_res
							? 64
							: 0 /* Checks if ephemeral_res is true or not */,
					});
				}
			}

			return this.interaction.createMessage({
				embeds: [
					this.statusEmbed(
						`Unable to find ${userid} - Check the user id and check if the user has been banned by using \`/ban list\``,
						false
					),
				],
				flags: config.ephemeral_errors
					? 64
					: 0 /* Checks if ephemeral_res is true or not */,
			});
		}
	}
}

//--

module.exports = Command;

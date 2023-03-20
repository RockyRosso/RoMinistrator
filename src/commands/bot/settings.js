//-- Variables

const { CommandBuilder } = require('../commandHandler');

const universeInfo = require('../../utils/universeInfo');

const fs = require('node:fs');
const config = require('../../config.json');
//--

//-- Event

class Command extends CommandBuilder {
	constructor() {
		super();

		this.data = {
			name: 'settings',
			type: this.cmd_types.chat_input,
			description: "Modify the bot's behavior",

			cooldown: 4000,

			default_member_permissions: this.permissions.moderateMembers,

			options: [
				{
					name: 'set',
					description: 'Configure certain bot settings',
					type: this.options.sub_command_group,

					options: [
						{
							name: 'universe-id',
							description:
								'The Universe ID is the ID for the game you wish for the bot to access',
							type: this.options.sub_command,

							options: [
								{
									name: 'value',
									description:
										'Enter the Universe ID into here',
									type: this.options.number,
									required: true,
								},
							],
						},

						{
							name: 'ephemeral-errors',
							description:
								'Determines if errors should be only visible to the executor or not',
							type: this.options.sub_command,

							options: [
								{
									name: 'value',
									description:
										'Enter a value for the setting',
									type: this.options.boolean,
									required: true,
								},
							],
						},

						{
							name: 'ephemeral-responses',
							description:
								'Determines if responses should be only visible to the executor or not',
							type: this.options.sub_command,

							options: [
								{
									name: 'value',
									description:
										'Enter the value for the setting',
									type: this.options.boolean,
									required: true,
								},
							],
						},
					],
				},

				{
					name: 'view',
					description:
						'View the currently set configurations for the bot',
					type: this.options.sub_command,
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
		const sub_cmd_group = this.getSubcommandGroup();

		if (sub_cmd_group) {
			if (sub_cmd_group.name === 'set') {
				const sub_cmd = this.getSubcommand(sub_cmd_group);

				if (sub_cmd.name === 'universe-id') {
					const uni_id = this.getOption(
						this.options.number,
						'value',
						sub_cmd
					).value;
					const uni_exi = await universeInfo.get_universe(uni_id);

					if (uni_exi.data.data.length > 0) {
						config.universe_id = uni_id;

						fs.writeFileSync(
							'./src/config.json',
							JSON.stringify(config, null, 4),
							(e) => console.error(e)
						);

						return this.interaction.createMessage({
							embeds: [
								this.statusEmbed(
									'Successfully set universe ID',
									true
								),
							],
							flags: config.ephemeral_res
								? 64
								: 0 /* Checks if ephemeral_res is true or not */,
						});
					}

					await this.interaction.createMessage({
						embeds: [
							this.statusEmbed(
								`\`${uni_id}\` is not a valid universe ID! Check the ID for any possible typos`,
								false
							),
						],
						flags: config.ephemeral_errors
							? 64
							: 0 /* Checks if ephemeral_res is true or not */,
					});

					/**********************************************************************************************************************************************************************************/
				} else if (sub_cmd.name === 'ephemeral-errors') {
					const value = this.getOption(
						this.options.boolean,
						'value',
						sub_cmd
					).value;

					config.ephemeral_errors = value;
					fs.writeFileSync(
						'./src/config.json',
						JSON.stringify(config, null, 4),
						(e) => console.error(e)
					);

					await this.interaction.createMessage({
						embeds: [
							this.statusEmbed(
								`Set ephemeral errors to \`${value}\``,
								true
							),
						],
						flags: config.ephemeral_res
							? 64
							: 0 /* Checks if ephemeral_res is true or not */,
					});
					/**********************************************************************************************************************************************************************************/
				} else if (sub_cmd.name === 'ephemeral-responses') {
					const value = this.getOption(
						this.options.boolean,
						'value',
						sub_cmd
					).value;

					config.ephemeral_res = value;
					fs.writeFileSync(
						'./src/config.json',
						JSON.stringify(config, null, 4),
						(e) => console.error(e)
					);

					await this.interaction.createMessage({
						embeds: [
							this.statusEmbed(
								`Set ephemeral responses to \`${value}\``,
								true
							),
						],
						flags: config.ephemeral_res
							? 64
							: 0 /* Checks if ephemeral_res is true or not */,
					});
				}
				/**********************************************************************************************************************************************************************************/
			}

			return;
		}

		const settings_embed = {
			color: Number(config.colors.bot_color),

			fields: [
				{
					name: 'Universe ID',
					value: `\`${config.universe_id}\``,
					inline: true,
				},
				{
					name: 'Ephemeral Responses',
					value: `\`${config.ephemeral_res}\``,
					inline: true,
				},
				{
					name: 'Ephemeral Errors',
					value: `\`${config.ephemeral_errors}\``,
					inline: true,
				},
			],

			author: {
				name: 'RoMinistrator',
				icon_url: this.client.user.avatarURL,
			},

			timestamp: new Date().toISOString(),
		};

		await this.interaction.createMessage({
			embeds: [settings_embed],
			flags: 64,
		});
	}
}

//--

module.exports = Command;

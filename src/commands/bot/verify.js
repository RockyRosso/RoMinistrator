//-- Variables

const { CommandBuilder } = require('../commandHandler');

const config = require('../../config.json');
const phrases = require('../../utils/phrase');

const fs = require('node:fs');

const axios = require('axios');

const comp_listener = require('../../utils/componentListener');

const datastore = require('../../utils/datastore');

require('dotenv').config();
const api_key = process.env.API_KEY;
const uni_id = config.universe_id;

//--

//-- Event

class Command extends CommandBuilder {
	constructor() {
		super();

		this.data = {
			name: 'verify',
			type: 1,
			description: 'Link your Roblox account with RoMinistrator',

			cooldown: 2000,

			options: [
				{
					name: 'username',
					description: "Enter the account you'd like to verify",
					type: this.options.string,
					required: true,
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
		const username = this.getOption(this.options.string, 'username').value;

		const is_verified = config.verified_users.find(
			(username) => username === username
		);

		if (is_verified) {
			return this.interaction.createMessage({
				embeds: [
					this.statusEmbed(`${username} is already verified!`, false),
				],
				flags: config.ephemeral_errors
					? 64
					: 0 /* Checks if ephemeral_res is true or not */,
			});
		}

		const res = await axios.get(
			'https://api.roblox.com/users/get-by-username',

			{
				params: {
					username,
				},
			}
		);

		if (!res.data.errorMessage) {
			const rblx_data = new datastore(
				api_key,
				uni_id,
				`romini_user-${res.data.Id}`,
				'users'
			);

			let phrase = phrases.generate();

			const verify_btns = {
				type: this.comp_types.action_row,

				components: [
					{
						type: this.comp_types.button,
						label: 'Verify',
						style: this.btn_styles.success,
						custom_id: 'verify_confirm',
					},

					{
						type: this.comp_types.button,
						label: 'Regenerate',
						style: this.btn_styles.secondary,
						custom_id: 'verify_regen',
					},
				],
			};

			const verify_embed = {
				title: 'Verify your account',
				description: `Paste the following phrase into the bio of the account \`${username}\`. Once completed, click the \`Verify\` button.

				\`${phrase}\`

				If the phrase ends up being filtered by Roblox, click the \`Regenerate\` button for a new phrase`,

				footer: {
					text: 'The prompt will expire in 60 seconds',
				},

				color: Number(config.colors.bot_color),
			};

			await this.interaction.createMessage({
				embeds: [verify_embed],
				components: [verify_btns],
			});

			const listener = comp_listener.listen(this.client, { time: 60000 });

			let verified = false;

			/* --- Component Listener --- */

			listener.on('event', (msg) => {
				if (msg.member.id === this.interaction.member.id) {
					if (msg.data.custom_id === 'verify_confirm') {
						axios
							.get(
								`https://users.roblox.com/v1/users/${res.data.Id}`
							)
							.then((data) => {
								const whitelisted_roles =
									config.whitelisted_roles;
								let perm = 'member';

								for (
									let i = 0;
									i < whitelisted_roles.length;
									i++
								) {
									if (
										this.interaction.member.roles.includes(
											whitelisted_roles[i]
										)
									) {
										perm = 'admin';
									}
								}

								if (phrase === data.data.description) {
									const verified_user = {
										discord_id: this.interaction.member.id,
										username: username,
										id: res.data.Id,
										perm,
									};

									rblx_data.get_data().then((data) => {
										if (typeof data !== 'string') {
											data.verified = true;
											data.perm_level = perm;

											rblx_data.add_data(data);
										} else {
											const userdata_temp =
												config.userdata_temp;
											userdata_temp.verified = true;
											userdata_temp.id = res.data.Id;
											userdata_temp.name = username;
											userdata_temp.perm_level = perm;

											rblx_data.add_data(userdata_temp);
										}
									});

									config.verified_users.push(verified_user);

									fs.writeFileSync(
										'./src/config.json',
										JSON.stringify(config, null, 4),
										(e) => console.error(e)
									);

									this.interaction.createFollowup({
										embeds: [
											this.statusEmbed(
												`Successfully verified ${username}!`,
												true
											),
										],
										flags: 64,
									});

									verify_btns.components[0].disabled = true;
									verify_btns.components[1].disabled = true;
									this.interaction.editOriginalMessage({
										embeds: [verify_embed],
										components: [verify_btns],
									});

									verified = true;

									return;
								}

								this.interaction.createFollowup({
									embeds: [
										this.statusEmbed(
											`Failed to verify ${username}. Make sure your Roblox description matches the provided phrase`,
											false
										),
									],
									flags: 64,
								});
							});
					} else if (msg.data.custom_id === 'verify_regen') {
						phrase = phrases.generate();

						verify_embed.description = `Paste the following phrase into the bio of the account \`${username}\`. Once completed, click the \`Verify\` button.

						\`${phrase}\`
		
						If the phrase ends up being filtered by Roblox, click the \`Regenerate\` button for a new phrase`;

						this.interaction.editOriginalMessage({
							embeds: [verify_embed],
						});

						msg.acknowledge();
					}

					return;
				}

				msg.createMessage({
					embeds: [
						this.statusEmbed('This prompt is not for you', false),
					],
					flags: 64,
				});
			});

			listener.on('end', () => {
				if (!verified) {
					verify_btns.components[0].disabled = true;
					verify_btns.components[1].disabled = true;

					this.interaction.editOriginalMessage({
						embeds: [verify_embed],
						components: [verify_btns],
					});
					this.interaction.createFollowup({
						embeds: [this.statusEmbed('Prompt timed out!', false)],
						flags: 64,
					});
				}
			});

			return;
		}

		await this.interaction.createMessage({
			embeds: [
				this.statusEmbed(`${username} is not a valid user!`, false),
			],
			flags: config.ephemeral_res
				? 64
				: 0 /* Checks if ephemeral_res is true or not */,
		});
	}
}

//--

module.exports = Command;

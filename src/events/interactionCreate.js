//-- Variables

const { CommandInteraction } = require('eris');
const cooldown = new Set();

const config = require('../config.json');

//

//-- Event

module.exports = {
	name: 'interactionCreate',

	async execute(interaction, client) {
		if (interaction instanceof CommandInteraction) {
			const cmd = client.cmds.get(interaction.data.name);

			let has_perms = false;

			if (!cmd) return;

			let status_embed = {
				color: Number(config.colors.bot_color),

				description: '',

				author: {
					name: 'RoUtilities',
					icon_url: client.user.avatarURL,
				},

				timestamp: new Date().toISOString(), // result example: Today at 9:52 AM
			};

			try {
				if (cmd.data.permissions) {
					status_embed.description =
						'You do not have permission to run this command';
					status_embed.color = Number(config.colors.error_color);

					if (config.whitelisted_roles.length > 0) {
						const mem_roles = interaction.member.roles;

						if (
							config.whitelisted_users.indexOf(
								interaction.member.id
							) > -1
						) {
							has_perms = true;
						} else {
							for (let i = 0; i < mem_roles.length; i++) {
								if (
									config.whitelisted_roles.indexOf(
										mem_roles[i]
									) > -1
								) {
									has_perms = true;
								}
							}
						}
					}

					if (
						!interaction.member.permissions.has(
							cmd.data.default_member_permissions
						) &&
						!has_perms
					)
						return await interaction.createMessage({
							embeds: [status_embed],
							flags: 64,
						});
				}

				if (!cooldown.has(interaction.member.id)) {
					if (cmd.data.cooldown > 0 || cmd.data.cooldown) {
						cooldown.add(interaction.member.id);

						setTimeout(() => {
							cooldown.delete(interaction.member.id);
						}, cmd.data.cooldown);
					}

					await cmd.data.run(interaction, client);
				} else {
					status_embed.description =
						'You are using this command too fast!';
					status_embed.color = Number(config.colors.error_color);

					await interaction.createMessage({
						embeds: [status_embed],
						flags: 64,
					});
				}
			} catch (e) {
				console.error(e);

				status_embed.description = 'An internal error occurred';
				status_embed.color = Number(config.colors.error_color);

				return interaction.createMessage({
					embeds: [status_embed],
					flags: 64,
				});
			}
		}
	},
};

//--

//-- Variables

const { CommandBuilder } = require('../commandHandler');

const config = require('../../config.json');

const comp_listener = require('../../utils/componentListener');

//--

//-- Event

class Command extends CommandBuilder {
	constructor() {
		super();

		this.data = {
			name: 'verified_users',
			type: 1,
			description:
				"Display a list of users who've verified their Roblox account with RoMinistrator",

			cooldown: 3000,

			default_member_permissions: this.permissions.moderateMembers,

			run: async (interaction, client) => {
				this.interaction = interaction;
				this.client = client;

				this.execute();
			},
		};
	}

	async execute() {
		const verified_users = config.verified_users;

		if (config.verified_users === 0) {
			return this.interaction.createMessage({
				embeds: [
					this.statusEmbed(
						'No users have verified their Roblox account with RoMinistrator yet...',
						false
					),
				],
				flags: config.ephemeral_errors ? 64 : 0,
			});
		}

		let listed = 0;

		const max = 5;
		let page_list = '';

		const pages = [];

		for (let i = 0; i < verified_users.length; i++) {
			if (listed >= max) {
				listed = 0;

				pages.push(page_list);
				page_list = '';
			}

			page_list += `<@${verified_users[i].discord_id}>
			**Roblox Username: ** ${verified_users[i].username}
			**Roblox UserID: ** ${verified_users[i].id}
			**Permissions:** ${verified_users[i].perm}\n\n`;
			listed++;
		}

		if (page_list.length > 1) {
			pages.push(page_list);
		}

		const disabled = pages.length > 1 ? false : true;

		let page_btns = {
			type: this.comp_types.action_row,

			components: [
				{
					type: this.comp_types.button,
					style: this.btn_styles.secondary,
					emoji: {
						id: null,
						name: '◀️',
					},
					custom_id: 'last_page',
					disabled: true,
				},

				{
					type: this.comp_types.button,
					style: this.btn_styles.primary,
					emoji: {
						id: null,
						name: '🏠',
					},
					custom_id: 'home_page',
					disabled,
				},

				{
					type: this.comp_types.button,
					style: this.btn_styles.secondary,
					emoji: {
						id: null,
						name: '▶️',
					},
					custom_id: 'next_page',
					disabled,
				},
			],
		};

		let page_embed = {
			color: Number(config.colors.bot_color),

			author: {
				name: 'RoMinistrator',
				icon_url: this.client.user.avatarURL,
			},

			description: '',

			footer: {
				text: `Page 1/${pages.length}`,
			},

			timestamp: new Date().toISOString(),
		};

		page_embed.description = pages[0];

		await this.interaction.createMessage({
			embeds: [page_embed],
			components: [page_btns],
		});

		const listener = comp_listener.listen(this.client, { time: 60000 });
		let curr_page = 1;

		/* --- Component Listener --- */

		listener.on('event', (msg) => {
			if (msg.member.id === this.interaction.member.id) {
				if (pages.length > 1) {
					const left = page_btns.components[0];
					const home = page_btns.components[1];
					const right = page_btns.components[2];

					left.disabled = false;
					home.disabled = false;
					right.disabled = false;

					if (msg.data.custom_id === 'last_page') {
						if (curr_page > 1) {
							curr_page -= 1;
						}
					} else if (msg.data.custom_id === 'next_page') {
						if (curr_page < pages.length) {
							curr_page += 1;
						}
					} else if (msg.data.custom_id === 'home_page') {
						curr_page = 1;
					}

					page_embed.description = pages[curr_page - 1];

					if (curr_page === 1) {
						left.disabled = true;
					} else if (curr_page === pages.length) {
						right.disabled = true;
					}

					page_embed.footer.text = `Page ${curr_page}/${pages.length}`;
					this.interaction.editOriginalMessage({
						embeds: [page_embed],
						components: [page_btns],
					});

					msg.acknowledge();
				}
			}
		});

		listener.on('end', () => {
			page_btns.components[0].disabled = true;
			page_btns.components[1].disabled = true;
			page_btns.components[2].disabled = true;

			this.interaction.editOriginalMessage({
				embeds: [page_embed],
				components: [page_btns],
			});
		});
	}
}

//--

module.exports = Command;

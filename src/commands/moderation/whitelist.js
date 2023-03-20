//-- Variables

const { CommandBuilder } = require('../commandHandler');
const config = require('../../config.json');
const fs = require('node:fs');

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
			name: 'whitelist',
			description: 'Add or remove a whitelisted role',
			type: this.cmd_types.chat_input,

			cooldown: 5000,

			default_member_permissions: this.permissions.moderateMembers,

			options: [
				{
					name: 'add',
					description: 'Add a role to the whitelist',
					type: this.options.sub_command,

					options: [
						{
							name: 'role',
							description: 'Choose a role',
							type: this.options.role,
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove a role from the whitelist',
					type: this.options.sub_command,

					options: [
						{
							name: 'role',
							description: 'Choose a role',
							type: this.options.role,
							required: true,
						},
					],
				},
				{
					name: 'view',
					description: 'View the current whitelist of roles',
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

	//-- Command Code --//

	async execute() {
		const sub_cmd = this.getSubcommand();
		const role = this.getOption(this.options.role, 'role', sub_cmd);
		let message;

		const whitelist = config.whitelisted_roles;

		if (sub_cmd.name !== 'view') {
			if (sub_cmd.name === 'add') {
				if (!whitelist.includes(role.value)) {
					whitelist.push(role.value);
				} else {
					return this.interaction.createMessage({
						embeds: [
							this.statusEmbed(
								`<@&${role.value}> is already on the whitelist`,
								false
							),
						],
					});
				}

				message = `Successfully added <@&${role.value}> to the whitelist!`;
			} else {
				const item_location = whitelist.indexOf(role.value);

				if (item_location > -1) {
					whitelist.splice(item_location, 1);
				} else {
					return this.interaction.createMessage({
						embeds: [
							this.statusEmbed(
								`<@&${role.value}> does not exist on the whitelist`,
								false
							),
						],
					});
				}

				message = `Successfully removed <@&${role.value}> from the whitelist`;
			}

			const members = this.interaction.member.guild.members;

			members.forEach((member) => {
				if (member.roles) {
					for (let i = 0; i < config.verified_users.length; i++) {
						if (
							member.roles.includes(role.value) &&
							config.verified_users[i].discord_id === member.id
						) {
							const rblx_data = new datastore(
								api_key,
								uni_id,
								`${config.keys.user_data}${config.verified_users[i].id}`,
								'users'
							);

							if (sub_cmd.name === 'remove') {
								config.verified_users[i].perm = 'member';
							} else {
								config.verified_users[i].perm = 'admin';
							}

							rblx_data.get_data().then((data) => {
								if (data) {
									data.perm_level =
										config.verified_users[i].perm;
									rblx_data.add_data(data);
								}
							});
						}
					}
				}
			});

			fs.writeFileSync(
				'./src/config.json',
				JSON.stringify(config, null, 4),
				(e) => console.error(e)
			);

			return this.interaction.createMessage({
				embeds: [this.statusEmbed(message, true)],
			});
		}

		if (whitelist.length > 0) {
			let roles_list = '';
			let listed = 0;

			const max = 10;
			const pages = [];

			for (let i = 0; i < whitelist.length; i++) {
				if (listed >= max) {
					listed = 0;

					pages.push(roles_list);
					roles_list = '';
				}
				roles_list += `<@&${whitelist[i]}>\n`;
				listed++;
			}

			if (roles_list.length > 1) {
				pages.push(roles_list);
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

			const list_embed = {
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

			list_embed.description = pages[0];

			await this.interaction.createMessage({
				embeds: [list_embed],
				components: [page_btns],
				flags: config.ephemeral_res
					? 64
					: 0 /* Checks if ephemeral_res is true or not */,
			});

			const listener = comp_listener.listen(this.client, {
				forever: true,
			});
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

						list_embed.description = pages[curr_page - 1];

						if (curr_page === 1) {
							left.disabled = true;
						} else if (curr_page === pages.length) {
							right.disabled = true;
						}

						list_embed.footer.text = `Page ${curr_page}/${pages.length}`;
						this.interaction.editOriginalMessage({
							embeds: [list_embed],
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
					embeds: [list_embed],
					components: [page_btns],
				});
			});
		} else {
			await this.interaction.createMessage({
				embeds: [
					this.statusEmbed(
						'You have no roles which are whitelisted',
						false
					),
				],
				flags: 64,
			});
		}
	}
}

//--

module.exports = Command;

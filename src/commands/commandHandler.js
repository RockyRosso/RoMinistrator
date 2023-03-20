//-- Variables

const {
	options,
	cmd_types,
	btn_styles,
	comp_types,
	permissions,
} = require('../utils/constants');
const config = require('../config.json');

//--

//-- Classes

class CommandBuilder {
	constructor() {
		this.data = {};
		this.interaction = null;
		this.client = null;

		this.options = options;
		this.cmd_types = cmd_types;
		this.comp_types = comp_types;
		this.btn_styles = btn_styles;
		this.permissions = permissions;
	}

	/**
	 * Get an option from the interaction data
	 * @param {number} option_type
	 * @param {string} option_name
	 * @param {object?} sub_cmd
	 */

	getOption(option_type, option_name, sub_cmd) {
		if (sub_cmd) {
			const option =
				sub_cmd.options.find(
					({ name, type }) =>
						name === option_name && type === option_type
				) || null;

			if (option) {
				return option;
			}
		}

		if (!this.interaction.data.options) {
			return null;
		}

		return (
			this.interaction.data.options.find(
				({ name, type }) => name === option_name && type === option_type
			) || null
		);
	}

	/**
	 * Get a subcommand
	 * @param {object?} sub_cmd_group If the subcommand is in a subcommand group, provide the subcommand group object
	 * @returns
	 */

	getSubcommand(sub_cmd_group) {
		if (sub_cmd_group) {
			const sub_cmd = sub_cmd_group.options.find(
				({ type }) => type === this.options.sub_command
			);

			if (sub_cmd) {
				return sub_cmd;
			}
		}

		return this.interaction.data.options.find(
			({ type }) => type === this.options.sub_command
		);
	}

	/**
	 * Get a subcommand group
	 * @returns {object}
	 */

	getSubcommandGroup() {
		return this.interaction.data.options.find(
			({ type }) => type === this.options.sub_command_group
		);
	}

	/**
	 * Create an embed which will show users the status of a request
	 * @param {string} description
	 * @param {boolean} success
	 */

	statusEmbed(description, success) {
		return {
			color: success
				? Number(config.colors.bot_color)
				: Number(config.colors.error_color),

			description,

			author: {
				name: 'RoMinistrator',
				icon_url: this.client.user.avatarURL,
			},

			timestamp: new Date().toISOString(), // result example: Today at 9:52 AM
		};
	}
}

//--

module.exports = { CommandBuilder };

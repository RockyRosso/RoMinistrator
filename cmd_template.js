//-- Variables

const { CommandBuilder } = require('./src/commands/commandHandler');

//--

//-- Event

class Command extends CommandBuilder {
	constructor() {
		super();

		this.data = {
			name: 'template',
			description: 'Command template',
			type: this.cmd_types.chat_input,

			run: async (interaction, client) => {
				this.interaction = interaction;
				this.client = client;

				this.execute();
			},
		};
	}

	//-- Command Code --//

	async execute() {
		await this.interaction.createMessage({
			content: `\`${
				Date.now() - this.interaction.createdAt
			}ms\` Pong! 🏓`,
			flags: 64,
		});
	}
}

//--

module.exports = Command;

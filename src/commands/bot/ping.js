//-- Variables

const { CommandBuilder } = require('../commandHandler');

//--

//-- Event

class Command extends CommandBuilder {
	constructor() {
		super();

		this.data = {
			name: 'ping',
			description: 'Check if the bot is responsive',
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
			content: 'Pong! 🏓',
			flags: 64,
		});
	}
}

//--

module.exports = Command;

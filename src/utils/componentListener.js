//-- Variables

const { EventEmitter } = require('node:events');

//--

//-- Classes

class ComponentListener extends EventEmitter {
	constructor(client, options = { forever: Boolean, time: Number }) {
		super();

		this.options = options;
		this.client = client;

		this.ended = false;

		this.listener = (interaction) => this.listen(interaction);

		this.collected = [];

		this.client.on('interactionCreate', this.listener);

		if (options.time) {
			setTimeout(() => this.stop_listen(), options.time);
		}
	}

	async listen(interaction) {
		this.emit('event', interaction);
		this.collected.push({ interaction });

		//interaction.acknowledge();

		if (this.collected.length >= this.options.max) {
			this.stop_listen();
			return true;
		}
	}

	async stop_listen() {
		if (this.ended) return;
		this.ended = true;

		if (!this.forever) {
			this.client.removeListener('interactionCreate', this.listener);
		}

		this.emit('end');
	}
}

//--

module.exports = {
	listen: (client, options) => {
		return new ComponentListener(client, options);
	},
};

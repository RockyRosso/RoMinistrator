//-- Variables

const { Collection } = require('eris');
const Eris = require('eris');
const fs = require('fs');

const config = require('./config.json');

const guild_Id = config.guildid;

//--

//-- Classes

class Bot extends Eris.Client {
	constructor(props) {
		super(props);

		this.cmds = new Collection();

		this.on('ready', () => {
			this.load_events();
			this.load_cmds();
		});
	}

	async load_cmds() {
		const cmdArray = [];
		const cmdFiles = fs.readdirSync('./src/commands');

		for (const cmd_folder of cmdFiles) {
			if (!cmd_folder.endsWith('.js')) {
				const cmd_files = fs
					.readdirSync(`./src/commands/${cmd_folder}`)
					.filter((file) => file.endsWith('.js'));

				for (const cmd_file of cmd_files) {
					const command = require(`./commands/${cmd_folder}/${cmd_file}`);
					const cmd = new command();

					this.cmds.set(cmd.data.name, cmd);
					cmdArray.push(cmd.data);
				}
			}
		}

		try {
			console.log('🕑 Loading slash commands...');

			await this.bulkEditGuildCommands(guild_Id, cmdArray);

			console.log('✅ Slash commands loaded!');
			console.log('✅ Ready to go!');
		} catch (e) {
			console.error(e);
		}
	}

	load_events() {
		const eventFiles = fs
			.readdirSync('./src/events')
			.filter((file) => file.endsWith('.js'));

		for (const file of eventFiles) {
			const event = require(`./events/${file}`);

			if (event.once) {
				this.once(event.name, (...args) =>
					event.execute(...args, this)
				);
			} else {
				this.on(event.name, (...args) => event.execute(...args, this));
			}
		}
	}
}

//--

module.exports = Bot;

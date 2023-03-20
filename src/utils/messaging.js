//-- Variables

const axios = require('axios').default;

//--

//-- Classes

class Messaging {
	/**
	 *
	 * @param {string} api_key
	 * @param {number} universe_id
	 */

	constructor(api_key, universe_id) {
		this.api_key = api_key;
		this.uni_id = universe_id;
	}

	/**
	 * Send a message to Roblox's messaging service
	 * @param {*} msg
	 */

	async send(msg) {
		const res = await axios
			.post(
				`https://apis.roblox.com/messaging-service/v1/universes/${this.uni_id}/topics/rblxmini`,

				{
					message: JSON.stringify(msg),
				},

				{
					headers: {
						'x-api-key': this.api_key,
						'Content-Type': 'application/json',
					},
				}
			)
			.catch((e) => {
				console.log(e.response);
				return false;
			});

		if (res) {
			return res;
		}
	}
}

//--

module.exports = Messaging;

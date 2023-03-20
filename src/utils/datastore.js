//-- Variables

const axios = require('axios');
const DSName = 'RoMini_DS';

const crypto = require('node:crypto');

//--

//-- Classes

class RBLXData {
	/**
	 * Construct class
	 * @param {string} apiKey
	 * @param {string} universe_id
	 * @param {string} key
	 * @param {string?} scope
	 */

	constructor(apiKey, universe_id, key, scope) {
		this.apiKey = apiKey;
		this.universe_id = universe_id;
		this.key = key;
		this.scope = scope;
	}

	/**
	 * Add data to Roblox's datastores
	 * @param {*} data
	 */

	async add_data(data) {
		const json_value = await JSON.stringify(data);
		const con_add = crypto
			.createHash('md5')
			.update(json_value)
			.digest('base64');

		const res = await axios
			.post(
				`https://apis.roblox.com/datastores/v1/universes/${this.universe_id}/standard-datastores/datastore/entries/entry`,
				data,

				{
					params: {
						datastoreName: DSName,
						scope: this.scope || 'main',
						entryKey: this.key,
					},

					headers: {
						'x-api-key': this.apiKey,
						'content-md5': con_add,
						'content-type': 'application/json',
					},
				}
			)
			.catch((e) => {
				console.error(e.response.data);
				return false;
			});

		if (res.data) {
			return true;
		}
	}

	async get_data() {
		const res = await axios
			.get(
				`https://apis.roblox.com/datastores/v1/universes/${this.universe_id}/standard-datastores/datastore/entries/entry`,
				{
					params: {
						datastoreName: DSName,
						scope: this.scope || 'main',
						entryKey: this.key,
					},

					headers: {
						'x-api-key': this.apiKey,
					},
				}
			)
			.catch((e) => {
				return e.response.data.message;
			});

		if (res) {
			if (typeof res === 'string') {
				return res;
			}

			return res.data;
		}
	}
}

//--

module.exports = RBLXData;

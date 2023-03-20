//-- Variables

const axios = require('axios');

//--

//-- Public Functions

/**
 * Get the information of a Roblox universe
 * @param {string} uni_id Universe ID
 * @returns
 */

exports.get_universe = async function (uni_id) {
	return await axios.get(
		`https://games.roblox.com/v1/games?universeIds=${uni_id}`
	);
};

//--

//-- Variables

const phrases = [
	'roblox',
	'cool',
	'get',
	'getting',
	'develop',
	'I',
	'wonder',
	'into',
	'when',
	'something',
	'dog',
	'cat',
	'bug',
	'ant',
	'leaf',
	'tree',
	'bot',
	'rocky',
	'rosso',
	'talk',
	'mini',
	'shrunk',
	'fast',
	'test',
];

//--

//-- Public Functions

exports.generate = function () {
	return `${phrases[Math.floor(Math.random() * phrases.length)]} ${
		phrases[Math.floor(Math.random() * phrases.length)]
	} ${phrases[Math.floor(Math.random() * phrases.length)]} ${
		phrases[Math.floor(Math.random() * phrases.length)]
	} ${phrases[Math.floor(Math.random() * phrases.length)]} ${
		phrases[Math.floor(Math.random() * phrases.length)]
	}`;
};

//--

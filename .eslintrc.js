module.exports = {
	env: {
		commonjs: true,
		es2021: true,
		node: true,
	},
	extends: 'eslint:recommended',
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
	},
	rules: {
		semi: 'error',
		'no-undef-init': 'error',
		'constructor-super': 'error',
	},
};

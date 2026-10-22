module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{js,html,json,svg,png,jpg,jpeg,webp,css}'
	],
	globIgnores: [
		'**/node_modules/**/*',
		'**/venv/**/*',
		'**/__pycache__/**/*',
		'servidor-ssr*/**/*',
		'servidor-mayk/**/*',
		'awebprogresivas/**/*',
		'docs/**/*',
		'**/*.report.html',
		'reporte-lighthouse*.html',
		'workbox-config.js'
	],
	swDest: 'sw.js',
	skipWaiting: true,
	clientsClaim: true,
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};
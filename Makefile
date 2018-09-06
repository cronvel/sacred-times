

BROWSERIFY=browserify
UGLIFY=uglifyjs


browser: browser/SacredTimes.js browser/SacredTimes.min.js browser/dom.min.js

browser/SacredTimes.js: lib/SacredTimes.js lib/Event.js
	${BROWSERIFY} lib/SacredTimes.js -s SacredTimes -o browser/SacredTimes.js

browser/SacredTimes.min.js: browser/SacredTimes.js
	${UGLIFY} browser/SacredTimes.js -o browser/SacredTimes.min.js -m

browser/dom.min.js: node_modules/dom-kit/browser/dom.min.js
	cp node_modules/dom-kit/browser/dom.min.js browser/dom.min.js


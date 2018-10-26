

BROWSERIFY=browserify
UGLIFY=uglifyjs
BABEL=babel


browser: browser/SacredTimes.js browser/SacredTimes.min.js browser/dom.min.js

gnome: gnome/extension.js

browser/SacredTimes.js: lib/SacredTimes.js lib/Event.js lib/PseudoDate.js
	${BROWSERIFY} lib/SacredTimes.js -s SacredTimes -o browser/SacredTimes.js

browser/SacredTimes.min.js: browser/SacredTimes.js
	${UGLIFY} browser/SacredTimes.js -o browser/SacredTimes.min.js -m

browser/dom.min.js: node_modules/dom-kit/browser/dom.min.js
	cp node_modules/dom-kit/browser/dom.min.js browser/dom.min.js

browser: browser/SacredTimes.js browser/SacredTimes.min.js browser/dom.min.js

gnome/extension.js: gnome/extension-src.js browser/SacredTimes.js
	cat browser/SacredTimes.js > gnome/extension.js
	cat gnome/extension-src.js >> gnome/extension.js


# TODO...
legacy-browser: browser/*.js
	cp browser/app.html legacy-browser/
	cp browser/app.css legacy-browser/
	cp -rf browser/fonts legacy-browser/
	cp -rf browser/images legacy-browser/
	${BABEL} browser --out-dir legacy-browser --presets=es2015


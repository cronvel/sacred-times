/*
	Sacred Times

	Copyright (c) 2020 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

/* global imports, SacredTimes */

"use strict" ;



const St = imports.gi.St ;
const Main = imports.ui.main ;
const Tweener = imports.tweener.tweener ;
const Mainloop = imports.mainloop ;

// console does not exist, but there are still debuging stuff in the lib, so we replace it
const console = { log: () => null } ;



let dateTimeText , text , button , timer ;



function _hideHello() {
	Main.uiGroup.remove_actor( text ) ;
	text = null ;
}



function _showHello() {
	if ( ! text ) {
		text = new St.Label( { style_class: 'helloworld-label' , text: dateTimeText } ) ;
		Main.uiGroup.add_actor( text ) ;
	}

	text.opacity = 255 ;

	let monitor = Main.layoutManager.primaryMonitor ;

	text.set_position(
		monitor.x + Math.floor( monitor.width / 2 - text.width / 2 ) ,
		monitor.y + Math.floor( monitor.height / 2 - text.height / 2 )
	) ;

	Tweener.addTween( text , {
		opacity: 0 ,
		time: 3 ,
		transition: 'easeOutQuad' ,
		onComplete: _hideHello
	} ) ;
}



const moonPhaseGlyphs = [ '🌑' , '🌒' , '🌓' , '🌔' , '🌕' , '🌖' , '🌗' , '🌘' ] ;

function _update() {
	let sacredTimes = new SacredTimes() ;
	let luniSolarDateTime = sacredTimes.getLuniSolarDateTime() ;
	let moonPhase = sacredTimes.getMoonPhase().phase ;
	let moonString = moonPhaseGlyphs[ Math.floor( 0.5 + moonPhase * 8 ) % 8 ] ;
	
	dateTimeText = ' ' + luniSolarDateTime.format( 'dddd D MMMM YYYY - HH:mm' ) + ' ' + moonString + ' ' ;
	let label = new St.Label( { text: dateTimeText } ) ;

	button.set_child( label ) ;
}



function init() {
	button = new St.Bin( {
		style_class: 'panel-button' ,
		reactive: true ,
		can_focus: true ,
		x_expand: true ,
		y_expand: false ,
		track_hover: true
	} ) ;

	/*
	let icon = new St.Icon( {
		icon_name: 'system-run-symbolic' ,
		style_class: 'system-status-icon'
	} ) ;
	*/

	_update() ;

	button.connect( 'button-press-event' , _showHello ) ;
}



function enable() {
	Main.panel._centerBox.insert_child_at_index( button , 10 ) ;

	timer = Mainloop.timeout_add( 1000 , () => {
		_update() ;
		return true ; // Repeat, like setInterval()
	} , null ) ;
}



function disable() {
	Main.panel._centerBox.remove_child( button ) ;
	Mainloop.source_remove( timer ) ;
}


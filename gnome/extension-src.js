
/* global imports, SacredTimes */

"use strict" ;

const St = imports.gi.St ;
const Main = imports.ui.main ;
const Tweener = imports.ui.tweener ;
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
		x_fill: true ,
		y_fill: false ,
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

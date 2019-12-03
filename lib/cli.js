/*
	Sacred Times

	Copyright (c) 2018 Cédric Ronvel

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

"use strict" ;



const SacredTimes = require( './SacredTimes.js' ) ;

const cliManager = require( 'utterminal' ).cli ;
const termkit = require( 'terminal-kit' ) ;
const term = termkit.terminal ;



function cli() {
	/* eslint-disable indent */
	cliManager.package( require( '../package.json' ) )
		.helpOption
		//.logOptions.camel
		.description( "The Sacred Calendar" )
		.arg( 'date' )
			.description( "The date" )
		.opt( [ 'longitude' , 'o' ] , 4 + 23 / 60 )	// Aubenas
			.description( "The longitude" )
		.opt( [ 'latitude' , 'a' ] , 44 + 37 / 60 )	// Aubenas
			.description( "The latitude" ) ;
		//.opt( 'opt' ).description( "that option" ) ;
	/* eslint-enable indent */

	var args = cliManager.run() ;

	var sacredTimes = new SacredTimes( args.date , args.latitude , args.longitude ) ;

	term( "Solar: %s\n" , sacredTimes.solarDateTime.toString() ) ;
	
	//*
	term( "UTC Year Sacred Times:\n" ) ;
	var utcSacred = sacredTimes.utcYearSacredTimes()
	for ( let name in utcSacred ) {
		term( "\t%s: %s\n" , name , utcSacred[ name ].toString() ) ;
	}
	
	term( "UTC local Sun:\n" ) ;
	var utcLocalSun = sacredTimes.utcLocalSun()
	for ( let name in utcLocalSun ) {
		term( "\t%s: %s\n" , name , utcLocalSun[ name ].toString() ) ;
	}
	
	term( "Solar Time Year Sacred Times:\n" ) ;
	var stSacred = sacredTimes.stYearSacredTimes()
	for ( let name in stSacred ) {
		term( "\t%s: %s\n" , name , stSacred[ name ].toString() ) ;
	}
	
	term( "Solar Time Year Celebration Days:\n" ) ;
	var stCelebration = sacredTimes.stYearCelebrationDays()
	for ( let name in stCelebration ) {
		term( "\t%s: %s\n" , name , stCelebration[ name ].toString() ) ;
	}

	term( "Upcoming events:\n" ) ;
	var events = sacredTimes.getUpcomingEvents() ;
	for ( let event of events ) {
		
		let flags = [] ;
		if ( event.isUpcoming ) { flags.push( 'upcoming' ) ; }
		if ( event.isMajor ) { flags.push( 'major' ) ; }
		
		if ( flags.length ) { flags = '[' + flags.join( ',' ) + '] ' ; }
		else { flags = '' ; }
		
		term( "\t%s: %s%s\n" , event.name , flags , event.date.toString() ) ;
	}
	
	var luniSolarDateTime = sacredTimes.getLuniSolarDateTime() ;
	term( "Luni-Solar: %s\n" , luniSolarDateTime.format( 'dddd D MMMM YYYY - HH:mm' ) ) ;
}

module.exports = cli ;




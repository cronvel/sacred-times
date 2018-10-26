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



const cliManager = require( 'utterminal' ).cli ;
const SacredTimes = require( './SacredTimes.js' ) ;



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

	console.log( "Solar:" , sacredTimes.solarDateTime , sacredTimes.solarDateTime.toString() ) ;
	console.log( sacredTimes.utcYearSacredTimes() ) ;
	console.log( sacredTimes.utcLocalSun() ) ;
	console.log( sacredTimes.stYearSacredTimes() ) ;
	console.log( sacredTimes.stYearCelebrationDays() ) ;
	console.log( sacredTimes.getUpcomingEvents() ) ;
	
	var luniSolarDateTime = sacredTimes.getLuniSolarDateTime() ;
	console.log( "Luni-Solar:" , luniSolarDateTime.format( 'dddd D MMMM YYYY - HH:mm' ) ) ;
}

module.exports = cli ;




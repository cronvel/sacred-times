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



function PseudoDate( data ) {
	this.date = data.date ;

	this.year = data.year ;
	this.month = data.month ,
	this.day = data.day ;
	this.hour = data.hour ;
	this.minute = data.minute ;
	this.second = data.second ;

	this.sunMoodHour = data.sunMoodHour ;
	this.sunMoodMinute = data.sunMoodMinute ;

	this.moonMoodHour = data.moonMoodHour ;
	this.moonMoodMinute = data.moonMoodMinute ;

	this._locale = 'en' ;
}

module.exports = PseudoDate ;



PseudoDate.prototype.locale = function( locale ) {
	this.locale = locale ;
	return this ;
} ;



// Lunar month name
const moonName = [
	'Prima' , // 1
	'Diana' , // 2
	'Tiara' , // 3
	'Cardina' , // 4
	'Quintella' , // 5
	'Sixtina' , // 6
	'Septima' , // 7
	'Octavia' , // 8
	'Nova' , // 9
	'Decalia' , // 10
	'Ondina' , // 11
	'Dominica' , // 12
	'Théresa' // 13
] ;



PseudoDate.prototype.format = function( format ) {
	/*
	format.replace( /L+/g , match => {
		if ( match === 'L' ) {
			if ( this.locale === 'fr' ) { return 'DD/MM/YYYY' ; }
			return 'MM/DD/YYYY' ;
		}
		if ( match === 'LL' ) {
			if ( this.locale === 'fr' ) { return 'D MMM YYYY' ; }
			return 'MMM D, YYYY' ;
		}
	} ) ;
	*/

	return format
		.replace( /(D+)( *)(M+)/g , ( match , day , spaces , month ) => {
			return month + spaces + day ;
		} )
		.replace( /(H+ *):( *m+)/g , ( match , hour , minute ) => {
			return hour + '°' + minute ;
		} )
		.replace( /\\.|([LlMQDdeEWwYgGAahHkmsSzZxX])\1*/g , match => {
			if ( match[ 0 ] === '\\' ) { return match.slice( 1 ) ; }

			switch ( match ) {
				case 'L' :
				case 'LL' :
				case 'l' :
				case 'll' :
					return moonName[ this.month - 1 ] + ' ' + this.day ;
				case 'LLL' :
				case 'LLLL' :
				case 'lll' :
				case 'llll' :
					return moonName[ this.month - 1 ] + ' ' + this.day +
						this.hour + '°' + ( this.minute < 10 ? '0' : '' ) + this.minute ;
				case 'D' :
					return this.day ;
				case 'DD' :
					return ( this.day < 10 ? '0' : '' ) + this.day ;
				case 'M' :
					return this.month ;
				case 'MM' :
					return ( this.month < 10 ? '0' : '' ) + this.month ;
				case 'MMM' :
				case 'MMMM' :
					return moonName[ this.month - 1 ] ;
				case 'H' :
				case 'HH' :
					return this.hour ;
				case 'm' :
				case 'mm' :
					return this.minute ;
				case 'd' :
				case 'dd' :
				case 'ddd' :
				case 'dddd' :
					return '' ;
				default :
					return '' ;
					//return '(' + match + ')' ;
			}
		} )
		.replace( /  +/g , ' ' ) ;
} ;



PseudoDate.prototype.valueOf = function() {
	return this.date.valueOf() ;
} ;



PseudoDate.prototype.toString = function() {
	return this.format( 'LLL' ) ;
} ;


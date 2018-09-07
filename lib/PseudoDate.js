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
	
	this.dayMood = data.dayMood ;

	this._locale = 'en' ;
}

module.exports = PseudoDate ;



PseudoDate.prototype.locale = function( locale ) {
	this.locale = locale ;
	return this ;
} ;



// Lunar month name
const moonth = [
	'Prima' , // 1
	'Diana' , // 2
	'Tiara' , // 3
	'Cardina' , // 4
	'' , // 5
	'' , // 6
	'Septima' , // 7
	'Octavia' , // 8
	'Nova' , // 9
	'Decalia' , // 10
	'Elisa' , // 11
	'' , // 12
	'Theresa' // 13
] ;



PseudoDate.prototype.format = function( format ) {
	var parts = [] ;

	if ( format.match( /L|M/ ) ) {
		parts.push(
			this.day + ( this.day === 1 ? 'er' : 'ème' ) +
			' jour de la ' +
			this.month + ( this.month === 1 ? 'ère' : 'ème' ) +
			' lune'
		) ;
	}
	
	if ( format.match( /LLL|H/ ) ) {
		parts.push(
			( parts.length ? 'à ' : '' ) +
			this.hour + '°' +
			( this.minute < 10 ? '0' : '' ) + this.minute
		) ;
	}

	return parts.join( ' ' ) ;
} ;



PseudoDate.prototype.valueOf = function() {
	return this.date.valueOf() ;
} ;



PseudoDate.prototype.toString = function() {
	return this.format( 'LLL' ) ;
} ;


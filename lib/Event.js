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



const moment = require( 'moment' ) ;



function Event( name , date , isUpcoming , isMajor ) {
	if ( ! ( date instanceof moment ) ) {
		date = moment.utc( date ) ;
	}

	this.name = name ;
	this.date = date ;
	this.isUpcoming = isUpcoming === undefined ? true : !! isUpcoming ;
	this.isMajor = isMajor === undefined ? true : !! isMajor ;
}

module.exports = Event ;



Event.sort = function( events ) {
	events.sort( ( a , b ) => a.date - b.date ) ;
	return events ;
} ;



Event.filterUpToNextMajor = function( events , dateTimeMin ) {
	var event , index ,
		indexMin = 0 ,
		indexMax = events.length ;

	Event.sort( events ) ;

	for ( index = 0 ; index < events.length ; index ++ ) {
		event = events[ index ] ;

		if ( dateTimeMin && event.date < dateTimeMin ) {
			indexMin = index + 1 ;
		}
		else if ( event.isMajor && event.isUpcoming && index + 1 < events.length ) {
			indexMax = index + 1 ;
			break ;
		}
	}

	if ( indexMin !== 0 || indexMax !== events.length ) {
		return events.slice( indexMin , indexMax ) ;
	}

	return events ;
} ;



Event.merge = function( ... eventLists ) {
	var events = [] ;

	eventLists.forEach( eventList => events.push( ... eventList ) ) ;
	Event.sort( events ) ;

	return events ;
} ;


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



const Seasons = require( 'seasons-dates' ) ;
const lune = require( 'lune' ) ;
const SunCalc = require( 'suncalc' ) ;	// This module is used for many calculation, like sunrise and sunset
const moment = require( 'moment' ) ;
const Event = require( './Event.js' ) ;



// Aubenas
const DEFAULT_LATITUDE = 44 + 37 / 60 ;
const DEFAULT_LONGITUDE = 4 + 23 / 60 ;



function SacredTimes( dateTime , latitude = DEFAULT_LATITUDE , longitude = DEFAULT_LONGITUDE , isLegalTime = false ) {
	this.universalDateTime = isLegalTime ? moment( dateTime ) : moment.utc( dateTime ) ;
	this.legalDateTime = moment( this.universalDateTime ).local() ;
	this.solarDelta = null ;
	this.solarUtcOffset = null ;
	this.solarDateTime = null ;
	this.latitude = latitude ;
	this.longitude = longitude ;

	this.computeSolarDateTime() ;
	this.lastLuniSolarNewYear = this.utcLastNewYear() ;
}

module.exports = SacredTimes ;



// Expose, for browser
SacredTimes.moment = moment ;
SacredTimes.SunCalc = SunCalc ;
require( 'moment/locale/fr' ) ;	// Force browserify to include fr locale



// Getters
SacredTimes.prototype.getUniversalDateTime = function() { return this.universalDateTime ; } ;
SacredTimes.prototype.getLegalDateTime = function() { return this.legalDateTime ; } ;
SacredTimes.prototype.getSolarDateTime = function() { return this.solarDateTime ; } ;



// This is exactly the Imbolc Sacred Time
SacredTimes.prototype.utcLastNewYear = function( dateTime ) {
	if ( ! dateTime ) { dateTime = this.universalDateTime ; }

	var moons , winterSolstice , moons , newYear ;
	
	winterSolstice = ( new Seasons( dateTime.year() - 1 ) ).winter ;
	moons = lune.phase_range( winterSolstice , dateTime , lune.PHASE_NEW ) ;
	
	if ( moons.length >= 2 ) {
		return moment.utc( moons[ 1 ] ) ;
	}
	
	winterSolstice = ( new Seasons( dateTime.year() - 2 ) ).winter ;
	moons = lune.phase_range( winterSolstice , dateTime , lune.PHASE_NEW ) ;
	
	return moment.utc( moons[ 1 ] ) ;
} ;



/*
	On pourrait faire commencer toujours le jour d'après.
	Un jour commencerait à l'aube, l'aube doit nécessairement tomber après le début d'un mois/d'une année.
	Quand il se produit, un 13ème mois est toujours le dernier mois de l'année, c'est un mois sacré.
	Les Dieux font le bilan et décident si oui ou non le monde peut renaître pour un nouveau cycle de 2 ou 3 ans.
*/

// fr: Fêtes de l'année
SacredTimes.prototype.utcYearSacredTimes = function( utcYear ) {
	if ( utcYear === undefined ) { utcYear = this.universalDateTime.year() ; }

	console.log( this.universalDateTime ) ;
	console.log( utcYear ) ;
	var moons ,
		pastYearSeasons = new Seasons( utcYear - 1 ) ,
		currentYearSeasons = new Seasons( utcYear ) ,
		sacredTimes = {} ;

	// First, compute all Solar Sacred Times
	sacredTimes.springEquinox = moment.utc( currentYearSeasons.spring ) ;
	sacredTimes.summerSolstice = moment.utc( currentYearSeasons.summer ) ;
	sacredTimes.autumnEquinox = moment.utc( currentYearSeasons.autumn ) ;
	sacredTimes.winterSolstice = moment.utc( currentYearSeasons.winter ) ;

	// Now the Moon Sacred Times
	moons = lune.phase_range( pastYearSeasons.winter , currentYearSeasons.spring , lune.PHASE_NEW ) ;
	sacredTimes.imbolc = moment.utc( moons[ 1 ] ) ;

	moons = lune.phase_range( currentYearSeasons.spring , currentYearSeasons.summer , lune.PHASE_FIRST ) ;
	sacredTimes.beltaine = moment.utc( moons[ 1 ] ) ;

	moons = lune.phase_range( currentYearSeasons.summer , currentYearSeasons.autumn , lune.PHASE_FULL ) ;
	sacredTimes.lugnasad = moment.utc( moons[ 1 ] ) ;

	moons = lune.phase_range( currentYearSeasons.autumn , currentYearSeasons.winter , lune.PHASE_LAST ) ;
	sacredTimes.samain = moment.utc( moons[ 1 ] ) ;

	return sacredTimes ;
} ;



// ST: Solar Time
SacredTimes.prototype.stYearSacredTimes = function( utcYear ) {
	return this.toSolar( this.utcYearSacredTimes( utcYear ) ) ;
} ;



// Map an object of dates+times to an object of dates of celebration
// Celebration comes the next day if the time is lesser than 6:00 am
SacredTimes.prototype.stYearCelebrationDays = function( utcYear ) {
	var celebrationDays = {} ,
		stDateTimes = this.stYearSacredTimes( utcYear ) ,
		sunData , delta ;

	/*
		The Imbolc day is the day of the sunrise following the Imbolc Sacred Time (2 hours of tolerance).
		It is typically celebrated the whole day, starting at the first double-hour (4:00)
	*/
	sunData = this.utcLocalSun( stDateTimes.imbolc.toDate() ) ;
	celebrationDays.imbolc = moment( stDateTimes.imbolc ).hour( 4 )
		.minute( 0 )
		.second( 0 )
		.millisecond( 0 ) ;
	delta = moment.duration( stDateTimes.imbolc.diff( sunData.sunrise ) ).subtract( 2 , "hours" ) ;

	console.log( "Imbolc comput:" , stDateTimes.imbolc , sunData.sunrise , delta.toISOString() ) ;

	if ( delta.subtract( 2 , "hours" ) > 0 ) {
		celebrationDays.imbolc.add( 1 , "day" ) ;
	}

	/*
		The spring equinox day is the day of the sunset following the spring equinox Sacred Time (no tolerance)
		The spring equinox is celebrated in the morning, at noon and in the afternoon.
	*/
	sunData = this.utcLocalSun( stDateTimes.springEquinox.toDate() ) ;
	celebrationDays.ostara = moment( stDateTimes.springEquinox ).hour( 10 )
		.minute( 0 )
		.second( 0 )
		.millisecond( 0 ) ;
	delta = moment.duration( stDateTimes.springEquinox.diff( sunData.sunset ) ) ;

	console.log( "Ostara comput:" , stDateTimes.springEquinox , sunData.sunset , delta.toISOString() ) ;

	if ( delta > 0 ) {
		celebrationDays.ostara.add( 1 , "day" ) ;
	}

	/*
		The Beltaine day of the noon following the Beltaine Sacred Time (2 hours of tolerance).
		It is typically celebrated the the morning (starting at 10:00), culminate at noon, possibly afternoon and evenning with some breaks.
	*/
	sunData = this.utcLocalSun( stDateTimes.beltaine.toDate() ) ;
	celebrationDays.beltaine = moment( stDateTimes.beltaine ).hour( 10 )
		.minute( 0 )
		.second( 0 )
		.millisecond( 0 ) ;
	delta = moment.duration( stDateTimes.beltaine.diff( sunData.solarNoon ) ).subtract( 2 , "hours" ) ;

	console.log( "Beltaine comput:" , stDateTimes.beltaine , sunData.solarNoon , delta.toISOString() ) ;

	if ( delta > 0 ) {
		celebrationDays.beltaine.add( 1 , "day" ) ;
	}

	/*
		The summer solstice day is the day of the sunset following the summer solstice Sacred Time (no tolerance)
		The summer solstice is celebrated at noon, in the afternoon, and in the evening.
	*/
	sunData = this.utcLocalSun( stDateTimes.summerSolstice.toDate() ) ;
	celebrationDays.litha = moment( stDateTimes.summerSolstice ).hour( 12 )
		.minute( 0 )
		.second( 0 )
		.millisecond( 0 ) ;
	delta = moment.duration( stDateTimes.summerSolstice.diff( sunData.sunset ) ) ;

	console.log( "Summer solstice comput:" , stDateTimes.summerSolstice , sunData.sunset , delta.toISOString() ) ;

	if ( delta > 0 ) {
		celebrationDays.litha.add( 1 , "day" ) ;
	}

	/*
		The Lugnasad day of the sunset following the Lugnasad Sacred Time (2 hours of tolerance).
		It is typically celebrated the end of the afternoon (starting at 16:00), culminate in the evening and at sunset, and continue in the night.
	*/
	sunData = this.utcLocalSun( stDateTimes.lugnasad.toDate() ) ;
	celebrationDays.lugnasad = moment( stDateTimes.lugnasad ).hour( 16 )
		.minute( 0 )
		.second( 0 )
		.millisecond( 0 ) ;
	delta = moment.duration( stDateTimes.lugnasad.diff( sunData.sunset ) ).subtract( 2 , "hours" ) ;

	console.log( "Lugnasad comput:" , stDateTimes.lugnasad , sunData.sunset , delta.toISOString() ) ;

	if ( delta > 0 ) {
		celebrationDays.lugnasad.add( 1 , "day" ) ;
	}

	/*
		The autumn equinox day is the day of the sunset following the autumn equinox Sacred Time (no tolerance)
		The autumn equinox is celebrated the morning until noon.
	*/
	sunData = this.utcLocalSun( stDateTimes.autumnEquinox.toDate() ) ;
	celebrationDays.mabon = moment( stDateTimes.autumnEquinox ).hour( 16 )
		.minute( 0 )
		.second( 0 )
		.millisecond( 0 ) ;
	delta = moment.duration( stDateTimes.autumnEquinox.diff( sunData.sunset ) ) ;

	console.log( "Autumn equinox comput:" , stDateTimes.autumnEquinox , sunData.sunset , delta.toISOString() ) ;

	if ( delta > 0 ) {
		celebrationDays.mabon.add( 1 , "day" ) ;
	}

	/*
		The Samain day of the sunset following the Samain Sacred Time (2 hours of tolerance).
		It is typically celebrated starting at sunset, and continue in the night, at least until midnight.
	*/
	sunData = this.utcLocalSun( stDateTimes.samain.toDate() ) ;
	celebrationDays.samain = moment( sunData.sunset ).local()
		.utcOffset( this.solarUtcOffset ) ;
	delta = moment.duration( stDateTimes.samain.diff( sunData.nextMidnight ) ).subtract( 2 , "hours" ) ;

	console.log( "Samain comput:" , stDateTimes.samain , sunData.nextMidnight , delta.toISOString() ) ;

	if ( delta > 0 ) {
		celebrationDays.samain.add( 1 , "day" ) ;

		// Adjust the sunset
		sunData = this.utcLocalSun( celebrationDays.samain.toDate() ) ;
		celebrationDays.samain = moment( sunData.sunset ).local()
			.utcOffset( this.solarUtcOffset ) ;
	}

	/*
		The winter solstice day is the day of the sunrise immediately followed by the winter solstice Sacred Time (no tolerance)
		The winter solstice is celebrated at night, after 18:00.
		This is the sole celebration that can happened before its Sacred Time.
	*/
	sunData = this.utcLocalSun( stDateTimes.winterSolstice.toDate() ) ;
	celebrationDays.yule = moment( stDateTimes.winterSolstice ).hour( 18 )
		.minute( 0 )
		.second( 0 )
		.millisecond( 0 ) ;
	delta = moment.duration( stDateTimes.winterSolstice.diff( sunData.sunrise ) ) ;

	console.log( "Winter solstice comput:" , stDateTimes.winterSolstice , sunData.sunrise , delta.toISOString() ) ;

	if ( delta < 0 ) {
		celebrationDays.yule.subtract( 1 , "day" ) ;
	}

	return celebrationDays ;
} ;



SacredTimes.prototype.utcLocalSun = function( dateTime ) {
	if ( ! dateTime ) { dateTime = this.universalDateTime.toDate() ; }

	var data = SunCalc.getTimes( dateTime , this.latitude , this.longitude ) ;
	data = this.toUtc( data ) ;
	data.nextMidnight = moment( data.nadir ).add( 1 , "day" ) ;

	return data ;
} ;



SacredTimes.prototype.computeSolarDateTime = function() {
	console.log( "universalDateTime:" , this.universalDateTime ) ;
	var sunData = this.utcLocalSun( this.universalDateTime.toDate() ) ,
		universalNoon = moment( sunData.solarNoon ).hour( 12 )
			.minute( 0 )
			.second( 0 )
			.millisecond( 0 ) ;

	console.log( "sunData:" , sunData ) ;

	console.log( "universalNoon:" , universalNoon , sunData.solarNoon , universalNoon.diff( sunData.solarNoon ) ) ;
	this.solarDelta = moment.duration( universalNoon.diff( sunData.solarNoon ) ) ;

	// This modify the date
	//this.solarDateTime = moment( this.universalDateTime ).add( this.solarDelta ) ;

	// Instead, this modify the utcOffset
	this.solarUtcOffset = this.durationToUtcOffset( this.solarDelta ) ;
	console.log( 'solarUtcOffset:' , this.solarUtcOffset , 'solarDelta:' , this.solarDelta ) ;
	this.solarDateTime = moment( this.universalDateTime ).local()
		.utcOffset( this.solarUtcOffset ) ;
	console.log( "solarDateTime:" , this.solarDateTime ) ;
} ;



SacredTimes.prototype.getMoonPhase = function() {
	return lune.phase( this.universalDateTime.toDate() ) ;
} ;



SacredTimes.prototype.getMoonPhaseUpcomingEvents = function( mode = 'legal' ) {
	var dateTime = this.universalDateTime ,
		events = [] ,
		startDateTime = moment( dateTime ).subtract( 36 , "hour" ) ,
		endDateTime = moment( dateTime ).add( 20 , "day" ) ,
		newMoon = lune.phase_range( startDateTime.toDate() , endDateTime.toDate() , lune.PHASE_NEW )[ 0 ] ,
		firstQuarter = lune.phase_range( startDateTime.toDate() , endDateTime.toDate() , lune.PHASE_FIRST )[ 0 ] ,
		fullMoon = lune.phase_range( startDateTime.toDate() , endDateTime.toDate() , lune.PHASE_FULL )[ 0 ] ,
		lastQuarter = lune.phase_range( startDateTime.toDate() , endDateTime.toDate() , lune.PHASE_LAST )[ 0 ] ;

	if ( newMoon ) {
		events.push( new Event( 'newMoon' , newMoon , newMoon >= dateTime , true ) ) ;
	}

	if ( firstQuarter ) {
		events.push( new Event( 'firstQuarterMoon' , firstQuarter , firstQuarter >= dateTime , false ) ) ;
	}

	if ( fullMoon ) {
		events.push( new Event( 'fullMoon' , fullMoon , fullMoon >= dateTime , true ) ) ;
	}

	if ( lastQuarter ) {
		events.push( new Event( "lastQuarterMoon" , lastQuarter , lastQuarter >= dateTime , false ) ) ;
	}

	events = Event.filterUpToNextMajor( events ) ;

	this.eventsToMode( events , mode ) ;

	return events ;
} ;



SacredTimes.prototype.getSacredTimeUpcomingEvents = function( mode = 'legal' ) {
	var dateTime = this.universalDateTime ,
		events = [] ,
		startDateTime = moment( dateTime ).subtract( 36 , "hour" ) ,
		//endDateTime = moment( dateTime ).add( 3 , "month" ) ,
		year = dateTime.year() ,
		sacredTimes ;

	sacredTimes = this.stYearSacredTimes( year - 1 ) ;
	Object.keys( sacredTimes ).forEach( name => events.push( new Event( name + 'SacredTime' , sacredTimes[ name ] , undefined , true ) ) ) ;

	sacredTimes = this.stYearSacredTimes( year ) ;
	Object.keys( sacredTimes ).forEach( name => events.push( new Event( name + 'SacredTime' , sacredTimes[ name ] , undefined , true ) ) ) ;

	sacredTimes = this.stYearSacredTimes( year + 1 ) ;
	Object.keys( sacredTimes ).forEach( name => events.push( new Event( name + 'SacredTime' , sacredTimes[ name ] , undefined , true ) ) ) ;

	events = Event.filterUpToNextMajor( events , startDateTime ) ;

	this.eventsToMode( events , mode ) ;

	return events ;
} ;



SacredTimes.prototype.getCelebrationUpcomingEvents = function( mode = 'legal' ) {
	var dateTime = this.universalDateTime ,
		events = [] ,
		startDateTime = moment( dateTime ).subtract( 36 , "hour" ) ,
		//endDateTime = moment( dateTime ).add( 3 , "month" ) ,
		year = dateTime.year() ,
		celebrations ;

	celebrations = this.stYearCelebrationDays( year - 1 ) ;
	Object.keys( celebrations ).forEach( name => events.push( new Event( name + 'CelebrationDay' , celebrations[ name ] , undefined , true ) ) ) ;

	celebrations = this.stYearCelebrationDays( year ) ;
	Object.keys( celebrations ).forEach( name => events.push( new Event( name + 'CelebrationDay' , celebrations[ name ] , undefined , true ) ) ) ;

	celebrations = this.stYearCelebrationDays( year + 1 ) ;
	Object.keys( celebrations ).forEach( name => events.push( new Event( name + 'CelebrationDay' , celebrations[ name ] , undefined , true ) ) ) ;

	events = Event.filterUpToNextMajor( events , startDateTime ) ;

	this.eventsToMode( events , mode ) ;

	return events ;
} ;



SacredTimes.prototype.getUpcomingEvents = function( mode = 'legal' ) {
	return Event.merge(
		this.getMoonPhaseUpcomingEvents( mode ) ,
		this.getSacredTimeUpcomingEvents( mode ) ,
		this.getCelebrationUpcomingEvents( mode )
	) ;
} ;



SacredTimes.prototype.eventsToMode = function( events , mode = 'legal' ) {
	events.forEach( event => event.date = this.toMode( event.date , mode ) ) ;
} ;



// Utilities



SacredTimes.prototype.toMode = function( dateTimes , mode = 'legal' ) {
	switch ( mode ) {
		case 'utc' : return this.toUtc( dateTimes ) ;
		case 'legal' : return this.toLegal( dateTimes ) ;
		case 'solar' : return this.toSolar( dateTimes ) ;
		default : return this.toLegal( dateTimes ) ;
	}
} ;



// Map an object of UTC dates+times to an object of Solar dates+times
SacredTimes.prototype.toUtc = function( dateTimes ) {
	if ( ( dateTimes instanceof moment ) || ( dateTimes instanceof Date ) ) {
		return moment.utc( dateTimes ) ;
	}

	var momentDateTimes = {} ;

	Object.keys( dateTimes ).forEach( name => momentDateTimes[ name ] = moment.utc( dateTimes[ name ] ) ) ;

	return momentDateTimes ;
} ;



SacredTimes.prototype.toLegal = function( dateTimes ) {
	if ( ( dateTimes instanceof moment ) || ( dateTimes instanceof Date ) ) {
		return moment( dateTimes ).local() ;
	}

	var momentDateTimes = {} ;

	Object.keys( dateTimes ).forEach( name => momentDateTimes[ name ] = moment( dateTimes[ name ] ).local() ) ;

	return momentDateTimes ;
} ;



// Map an object of UTC dates+times to an object of Solar dates+times
SacredTimes.prototype.toSolar = function( dateTimes ) {
	if ( ( dateTimes instanceof moment ) || ( dateTimes instanceof Date ) ) {
		return moment( dateTimes ).local()
			.utcOffset( this.solarUtcOffset ) ;
	}

	var momentDateTimes = {} ;

	Object.keys( dateTimes ).forEach( name => momentDateTimes[ name ] = moment( dateTimes[ name ] ).local()
		.utcOffset( this.solarUtcOffset ) ) ;

	return momentDateTimes ;
} ;



SacredTimes.prototype.toNextDay = function( dateTimes ) {
	var momentDateTimes = {} ;

	Object.keys( dateTimes ).forEach( name => {
		momentDateTimes[ name ] = moment( dateTimes[ name ] ).hour( 12 )
			.minute( 0 )
			.second( 0 )
			.millisecond( 0 ) ;

		if ( dateTimes[ name ].hour() >= 6 ) {
			momentDateTimes[ name ].add( 1 , "day" ) ;
		}
	} ) ;

	return momentDateTimes ;
} ;



SacredTimes.prototype.durationToUtcOffset = function( duration ) {
	return ( '' + this.solarDelta.hours() + ':' + Math.abs( this.solarDelta.minutes() ) )
		.replace( /^[0-9]/ , '+$&' )
		.replace( /([0-9]+)/g , number => number.length === 1 ? '0' + number : number ) ;
} ;


const express = require('express');
var request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');
const _ = require('lodash');
const Nightmare = require('nightmare');
require('nightmare-iframe-manager')(Nightmare);
const xray = require('x-ray');
const xr = xray();
const app = express();

//const mongojs = require('mongojs');
//const db = mongojs("mongodb://cunyadmin:cuny123@ds127948.mlab.com:27948/cunyfirst", ["events"]);

const base = 'http://events.cuny.edu/';

/*
function getEvents(college, pages){
  return xr(base, '#menu > div ul li:nth-child(n+' + college + ')',{
    college_name: 'a', 
    college_events: xr('#menu > div ul li:nth-child(n+' + college + ') a@href', ['#listing div[class*=block-txt] .event-txt h3 a'])
      .paginate(".pageNumber a@href")
      .limit(pages), //visits college page and paginates every event for that college
    event_dates: xr('#menu > div ul li:nth-child(n+' + college + ') a@href', ['#listing div[class=block-txt] .event-txt h4 a']),
    event_descriptions: xr('#menu > div ul li:nth-child(n+' + college + ') a@href', ['#listing div[class=block-txt] .event-txt .short-description']),
    event_link: xr('#menu > div ul li:nth-child(n+' + college + ') a@href', ['#listing div[class=block-txt] .event-txt h3 a@href'])

  })((err, obj) => {
    var packet = {
      college_name: obj.college_name,
      event_data: _.zip(obj.college_events, obj.event_dates, obj.event_descriptions, obj.event_link),
    }
//    db.events.insert(packet);
    console.log(packet);
  })
}
*/

function getEvents(college, pages){
  return xr(base, {

         events: xr('.col450', '#listing div[class*=block-txt]', [{
         title: '.event-txt h3 a',
         event_date: '.event-txt h4 a',
         event_description: '.event-txt .short-description',
         event_link: '.event-txt h3 a@href',
         }])
   })( (err, obj) => {
      
          obj.forEach( 
            x => {
              x.events.forEach(
                y => {
                  
                  var cleaned_events = {
                    title:  y.title.replace(/[^\x20-\x7E]/gmi, "").replace(/  +/g, ' '),
                    event:  y.event_date.replace(/[^\x20-\x7E]/gmi, "").replace(/  +/g, ' '),
                    description: y.event_description.replace(/[^\x20-\x7E]/gmi, "").replace(/  +/g, ' ').slice(0,-3),
                    link: y.event_link,
                  }

                  console.log(cleaned_events);
                }
              )
            }
          )

   })
        .paginate(".pageNumber a@href")
        .limit(pages) //visits college page and paginates every event for that college
      
}

getEvents(1,4);
(function getEventsForAllColleges(pages){
   for(var i = 1; i < 27; i++){
    getEvents(i, pages);
  }
})



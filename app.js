const express = require('express');
const Config = require('config-js');
const config = new Config('config.js');
const fs = require('fs');
const mongojs = require('mongojs');
const cheerio = require('cheerio');
const Nightmare = require('nightmare');
require('nightmare-iframe-manager')(Nightmare);
const xray = require('x-ray');
const xr = xray({
  filters: {
    trim: function (value) {
      return typeof value === 'string' ? value.trim() : value
    },
    reverse: function (value) {
      return typeof value === 'string' ? value.split('').reverse().join('') : value
    },
    slice: function (value, start , end) {
      return typeof value === 'string' ? value.slice(start, end) : value
    }
  }});

const db = mongojs('mongodb://cunyadmin:cuny123@ds127948.mlab.com:27948/cunyfirst', ['colleges','courses', 'events', 'subjects']);

const user = config.get('logging.user');
const pass = config.get('logging.pass');

// first iframe src
const toSearch = "https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL?FolderPath=PORTAL_ROOT_OBJECT.HC_SSS_STUDENT_CENTER&IsFolder=false&IgnoreParamTempl=FolderPath%2cIsFolder&PortalActualURL=https%3a%2f%2fhrsa.cunyfirst.cuny.edu%2fpsc%2fcnyhcprd%2fEMPLOYEE%2fHRMS%2fc%2fSA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL&PortalContentURL=https%3a%2f%2fhrsa.cunyfirst.cuny.edu%2fpsc%2fcnyhcprd%2fEMPLOYEE%2fHRMS%2fc%2fSA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL&PortalContentProvider=HRMS&PortalCRefLabel=Student%20Center&PortalRegistryName=EMPLOYEE&PortalServletURI=https%3a%2f%2fhome.cunyfirst.cuny.edu%2fpsp%2fcnyepprd%2f&PortalURI=https%3a%2f%2fhome.cunyfirst.cuny.edu%2fpsc%2fcnyepprd%2f&PortalHostNode=EMPL&NoCrumbs=yes&PortalKeyStruct=yes";


const app = express();

//define a new Nightmare action named "clearCache"
Nightmare.action('clearCache',
  //define the action to run inside Electron
  function(name, options, parent, win, renderer, done) {
    //call the IPC parent's `respondTo` method for clearCache...
    parent.respondTo('clearCache', function(done) {
      //clear the session cache and call the action's `done`
      win.webContents.session.clearCache(done);
    });
    //call the action creation `done`
    done();
  },
  function(done) {
    //use the IPC child's `call` to call the action added to the Electron instance
    this.child.call('clearCache', done);
  });
/**********************************************************************/
                            /* useful plugins */
/**********************************************************************/

/*
 * on the current nightmare instance logs into cuny first
 * and visits the main search page
 */
var startScraper = exports.startScraper = (user,pass) => {
  return (nightmare) => {
    nightmare
      .use(login(user, pass))
      .clearCache()
      .use(search())
    .wait(3000)
  }
}

var login = exports.login = (user, pass) => {
  return (nightmare) => {
    nightmare
      .goto('https://home.cunyfirst.cuny.edu/oam/Portal_Login1.html')
        .insert('#cf-login', user)
        .insert('#password', pass)
        .click('#login-form > form > input[type="image"]')
  };
};

var search = exports.search = () => {
  return (nightmare) => {
    nightmare 
  // visit student center
      .wait('#login-form > form > input[type="image"]')
      .click('#login-form > form > input[type="image"]')
      .wait("#crefli_HC_SSS_STUDENT_CENTER > a")
        .click("#crefli_HC_SSS_STUDENT_CENTER > a")
  // visit search (First iframe)
        .goto(toSearch)
          .wait("#DERIVED_SSS_SCR_SSS_LINK_ANCHOR1")
          .click('#DERIVED_SSS_SCR_SSS_LINK_ANCHOR1')
  }
}

/*
 * given the school and the subject; will return all subjects 
 * the school has to offer
 */
var selectSchoolAndSubject = exports.selectSchoolAndSubject = (school, subject) => {
  return (nightmare) => {
    nightmare
 // search classes
      .wait(3000)
      .select("#CLASS_SRCH_WRK2_INSTITUTION\\$31\\$", value="" + school)
      .wait(3000)
      .select("#SSR_CLSRCH_WRK_SUBJECT_SRCH\\$0", value="" + subject)
      .wait(3000)
  //    .uncheck("#SSR_CLSRCH_WRK_SSR_OPEN_ONLY\\$5")
      .click("#CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH")
      .wait("#ACE_\\$ICField\\$4\\$\\$0")
  }
}

/**********************************************************************/
                              // bots
/**********************************************************************/
function getAllCoursesFor(school, subject){
  Nightmare({
    show: false,
    executionTimeout: 10000000,
    gotoTimeout: 10000000,
  })
    .use(startScraper(user, pass))
    .use(selectSchoolAndSubject(school,subject))
  // get courses for one subject under one college
 //-----------------------------------> 
    .evaluate( ()  => { 
      return document.querySelector("#ACE_\\$ICField\\$4\\$\\$0").innerHTML;
    })
    .end()
    .then( text => {
      getCourses(school, text);
    })
  //--------------------------------->
  .catch( err => console.error(err))
}

function getAllColleges(){

  Nightmare({
    show: false,
    executionTimeout: 10000000,
    gotoTimeout: 10000000,
    waitTimeout: 1000000 
  })
    .use(startScraper(user, pass))
    
    .wait(3000)
    .evaluate( () => {
      return document.querySelector("#win0divCLASS_SRCH_WRK2_INSTITUTION\\$31\\$").innerHTML;
    })
    .end()
    .then( text => {
       getCollegeData(text);
    })  
  .catch( err => console.error(err))
}

function getAllSubjectsFor(school){
  Nightmare({
    show: false,
    executionTimeout: 10000000,
    gotoTimeout: 10000000,
  })
    .use(startScraper(user, pass))

  // get all subjects for this school here
  //--------------------------------------------
    .select("#CLASS_SRCH_WRK2_INSTITUTION\\$31\\$", value="" + school)
    .wait(3000)
    .evaluate( () => {   
      return document.querySelector("#win0divSSR_CLSRCH_WRK_SUBJECT_SRCH\\$0").innerHTML;
    })
    .then( text => {
      getSubjects(school, text);
    })
  //--------------------------------------------
  .catch(err => console.log(err))

}

/**********************************************************************/
                      // scrapers to json formats
/**********************************************************************/
// text => "#win0divCLASS_SRCH_WRK2_INSTITUTION\\$31\\$"
function getCollegeData(text){
  xr(text, 'option:nth-child(n+2)', [{ 
    college_name: xr('option'),
    college_code: xr('option@value'),
  }])((err, obj) => db.colleges.insert(obj))
}



function getSubjects(school, text) {
  xr(text, 'option:nth-child(n+2)', [{
    subject: xr('option'),
    code: xr('option@value'),
  }])((err, subjects) => db.subjects.insert({school , subjects}))
}

/* 
 * returns all the courses on page, must be on 
 * courses page => "#ACE_\\$ICField\\$4\\$\\$0"
 *
 */
function getCourses(school, text){
  xr(text, 'div[id*="win0divSSR_CLSRSLT_WRK_GROUPBOX2\\$"]', [{
    course_name: '.PAGROUPBOXLABELLEVEL1', 
    course_nbr: '.PSLEVEL3GRIDROW span[title="Class Nbr"]',
    section: '.PSLEVEL3GRIDROW span[title="View Details"]',
    days_times: 'tr:nth-child(1) > td div table[class=PSLEVEL1GRIDNBONBO] td[class=PSLEVEL3GRIDROW]:nth-child(3) span',
    room: 'tr:nth-child(1) > td div table[class=PSLEVEL1GRIDNBONBO] td[class=PSLEVEL3GRIDROW]:nth-child(4) span',
    instructor: 'tr:nth-child(1) > td div table[class=PSLEVEL1GRIDNBONBO] td[class=PSLEVEL3GRIDROW]:nth-child(5) span',
    meeting_dates: 'tr:nth-child(1) > td div table[class=PSLEVEL1GRIDNBONBO] td[class=PSLEVEL3GRIDROW]:nth-child(6) span',
    status: 'tr:nth-child(1) > td div table[class=PSLEVEL1GRIDNBONBO] td[class=PSLEVEL3GRIDROW]:nth-child(7) img@alt',
  }])((err, courses) => db.courses.insert({school , courses}))
}

                    /* debugging function calls */

//getAllCoursesFor("LEH01", "CMP");

//getAllSubjectsFor("QNS01");

//getAllColleges();

/**********************************************************************/
                          /* My end points */
/**********************************************************************/


app.get('/', (req, res) => {
  res.send("please use another endpoint: /api");
})

app.get('/api/events', (req, res) => {
  db.events.find(function(err, events){
    if(err){
      res.send("ERROR");
    }
    res.json(events);
  });
})


app.get('/api/subjectsFor/:school', (req, res) => {
  let school = req.params.school
  getAllSubjectsFor(school);

  db.subjects.find(function(err, subjects){
    if(err) {
      res.send("ERROR");
    }
    res.json(subjects);
  });
})


app.get('/api/colleges', (req, res) => {
  db.colleges.find(function(err, colleges){
    if(err) {
      res.send("ERROR");
    }
    res.json(colleges);
  });
})


app.get('/api/subjects', (req, res) => {
  db.subjects.find(function(err, subjects){
    if(err) {
      res.send("ERROR");
    }
    res.json(subjects);
  });
})

app.get('/api/courses', (req, res) => {
  db.courses.find(function(err, courses){
    if(err) {
      res.send("ERROR");
    }
    res.json(courses);
  })
})

app.get('/api/:school/:subject', (req, res) => {
  var school = req.params.school;
  var subject = req.params.subject;

  getAllCoursesFor(school, subject);

  db.courses.find(function(err, courses){
    if(err) {
      res.send("ERROR");
    }
    res.json(courses);
  })
})

app.listen(3000);
console.log("running on port: 3000 .... ");

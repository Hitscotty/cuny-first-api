const Nightmare = requore('nightmare');
require('nightmare-iframe-manager')(Nightmare);


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



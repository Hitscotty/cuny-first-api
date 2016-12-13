# cuny-first-api
 I've created two api's one for cuny-first to get structured data about classes and registration. The second api returns data
 from cuny.edu I've put it together as one giant api. Happy developing!


#endpoints

###/api/colleges
gives you list of cuny colleges and their unique cuny Code

``` json
[
  {
    "_id": "584c9c5dbd8e316f16be3001",
    "college_name": "Baruch College",
    "college_code": "BAR01"
  },
  ...
]
```

###/api/subjects
gives you list of all colleges and the subjects each offers 

```json
[{
    "_id": "584ca203eeb002710b75da7e",
    "school": "BAR01",
    "subjects": [
      {
        "subject": "AAS - Asian American Studies",
        "code": "AAS"
      },
      ...
      ],
}]
```

###/api/subjectsFor/:CollegeCode
gives you list of all subjects taught at specified college `/api/subjectsFor/BAR01`:

```json
[{
    "_id": "584ca203eeb002710b75da7e",
    "school": "BAR01",
    "subjects": [
      {
        "subject": "AAS - Asian American Studies",
        "code": "AAS"
      }, ... ]
}]
```

###/api/courses
gives you list of schools and their courses

``` json
  [{
    "_id": "584ca4ce970aed7266cbdfbb",
    "school": "LEH01",
    "courses": [
      {
        "course_name": " CMP  108 - Programming for Non-Computer Science Majors ",
        "course_nbr": "57229",
        "section": "01LB-LAB\nRegular",
        "days_times": "Mo 1:50PM - 3:30PM",
        "room": "Gillet 231",
        "instructor": "Staff",
        "meeting_dates": "01/30/2017 - 05/26/2017",
        "status": "Open"
      }, ... ]}, 
     ]
```

###/api/:school_code/:subject_code
gives you list of all courses in specified subject in specified college

``` json
  {
    "_id": "584f2a3bca024ba3d125f2d0",
    "school": "LEH01",
    "courses": [
      {
        "course_name": " BIO  167 - Principles of Biology: Organisms ",
        "course_nbr": "55515",
        "section": "04LC-LEC\nRegular",
        "days_times": "Sa 9:00AM - 11:40AM",
        "room": "Science 1405",
        "instructor": "Paula Gore",
        "meeting_dates": "01/30/2017 - 05/26/2017",
        "status": "Open"
      }, ... ],
   }
  ```

###/api/events
gives you list of all events in cuny

``` json
[{ 
  "title": "Composers Concert II",
  "event": " December 12, 2016 | Brooklyn College 7:00 PM ",
  "description": "Conservatory of Music composers present their new acoustic and electroacoustic works. ",
  "link": "http://events.cuny.edu/eventDetail.asp?EventId=77306"
}, ...]

```

# local testing and contributing

``` bash
git clone https://github.com/Hitscotty/cuny-first-api
cd cuny-first-api
npm install
```

Make a new `config.js` file and use your cuny user name and cuny password like so: *(include quotes)*

``` js

module.exports = {

      logging : {
                user: 'cuny username',              
                pass: 'cuny password',            
            }
};

```

Start the server on localhost:3000
``` bash
npm start
```

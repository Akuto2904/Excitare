# Stack

Excitare's API runs off of Flask utilising sqlalchemy to interface with an SQLite database.

The database stores, alarm info, review info and user info.

# How to run: 

Inside directory /Backend/ run command: python app.py
Inside directory / Client/ run command: npm run dev

# Endpoints implemented:
##      Alarms: 
        @ Route: /api/alarms

            **GET** Endpoint - retrieves all alarms

            **PUT** Endpoint - updates an existing alarm, given JSON of new alarm state

            **DELETE** Endpoint - removes an alarm, given JSON data containing alarmID

        @ Route: /api/alarm/<int:id>

            **GET** Endpoint - retrives alarm json given alarm ID in url

            **POST** Endpoint - Posts new given alarm given in JSON, at given the alarm's ID in url

        @ Route: /api/rating/<int:alarmIdGiven>

            **GET** Endpoint - Retrieves an alarm's average rating as json given the alarms ID in url

##      Users: 
        @ Route: /api/users

            **GET** Endpoint - retrieves all users

            **PUT** Endpoint - updates an existing user, given JSON of new user state

            **POST** Endpoint - posts new user given user JSON

            **DELETE** Endpoint - removes a user, given JSON data containing user's ID

        @ Route: /api/user/<int:id>

            **GET** Endpoint - retrives user json given users ID in url

        @ Route: /api/user/<string:username>

            **GET** Endpoint - retrives user json given users username in url

        @ Route: /api/user/<int:id>/status

            **GET** Endpoint - Retrieves user status as json given users ID in url


##      Reviews: 
        @ Route: /api/reviews/<int:alarmIdGiven>

            **Get** Endpoint - retrives an alarm's reviews as json given the alarms ID in url

            **POST** Endpoint - posts new review given json of new review and given the alarms ID in url 

        @ Route: /api/reviews

            **DELETE** Endpoint - deletes an alarm's review given a JSON containing the review's ID

##      Login: 
        @ Route: /api/login

            **POST** Endpoint - given users email and password in a json returns authentication and user information

##      Google Calendar Integration

        @ Route: /api/<string:userID>/calendarLogin

            **Login** Endpoint - Send user here and it'll redirect to google authentication
        
        @ Route: /calendarLoginRedirect

           **After Login Redirect** Endpoint - User is sent here after google authentication, saves credentials to database then redirects to frontend
        
        @ Route: /api/<string:userID>/calendars

           **GET** Endpoint - Returns JSON of users google calendars to make a selection with

        @ Route: /api/setCalendar/<string:userID>

           **PUT** Endpoint - Given a calendarID in a JSON, sets the user in url's chosen calendar
        
        @ Route: /api/<string:userID>/firstClass

           **GET** Endpoint - Retrieves the name and the time of the first event scheduled the next day for the user in url

## Frontend setup
1. Navigate to the Frontend directory:
   cd Client

2. Install dependencies
   npm install

3. Run the development server:
   npm run dev
   
5. Open the app in browser

## Test accounts

Standard User :
Email: testemail1@gmail.com
password: 123

Locked User:
Email: testemail2@gmail.com
Password: 123

Admin user: 
Email: testemail3@gmail.com
Password: 123

## Frontend Features
-User login and authentication 
-Browse available alarms
-View alarm details 
-Set current alarm 
-Submit and view reviews 
-Settings page : Google calendar integration 
-Accessibility features 
-logout function

##Frontend Usability testing 
Test tasks included
-Logging in as a standard user
-Browsing alarms 
-Viewing alarm details 
-selecting an alarm 
-submitting a review 
-accessing setting 
-connecting google calendar
-using accessibility features
-logging out 

Results: 
-All core features worked as expected 
-Minor issued where idetified and resolved during development (e.g nav bugs, UI consistency)


##Frontend API Usage 
the frontend communicates with the backend API using the following endpoints:

POST /api/login
-Used for user authentication 

GET /api/alarms
- Retrives all alarms

GET /api/alarm/:id
- Retrieves a specific alarm

Get /api/reviews/:alarmId
- Retrieves reviews for an alarm

POST /api/reviews/:alarmId
- Submits a review

GET /api/rating/:alarmID
- Retrieves average rating

PUT /api/users
- Updates selected alarm

GET /api/:userId/calendars
-Retrieves user's google calendars

PUT /setCalendar/:userID
-Saves selected calendar 

GET /api/:userID/firstClass
-Retrieves next class information




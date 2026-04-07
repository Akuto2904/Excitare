# Stack

Excitare's API runs off of Flask utilising sqlalchemy to interface with an SQLite database.

The database stores, alarm info, review info and user info.

# How to run: 

Inside directory /Backend/ run command: python app.py

# Endpoints implemented:
##      Alarms: 
        @ Route: /api/alarms

            **Get** Endpoint - retrieves all alarms
                curl -H "X-API-KEY: ValidAPIKey" http://localhost:5000/api/alarms

            **PUT** Endpoint - updates an existing alarm, given JSON of new alarm state

            **DELETE** Endpoint - removes an alarm, given JSON data containing alarmID

        @ Route: /api/alarm/<int:id>

            **Get** Endpoint - retrives alarm json given alarm ID in url

            **Post** Endpoint - Posts new given alarm given in JSON, at given the alarm's ID in url


##      Users: 
        @ Route: /api/users

            **Get** Endpoint - retrieves all users

            **PUT** Endpoint - updates an existing user, given JSON of new user state

            **POST** Endpoint - posts new user given user JSON

            **DELETE** Endpoint - removes a user, given JSON data containing user's ID

        @ Route: /api/user/<int:id>

            **Get** Endpoint - retrives user json given users ID in url

        @ Route: /api/user/<string:username>

            **Get** Endpoint - retrives user json given users username in url


##      Reviews: 
        @ Route: /api/reviews/<int:alarmIdGiven>

            **Get** Endpoint - retrives an alarm's reviews as json given the alarms ID in url

            **POST** Endpoint - posts new review given json of new review and given the alarms ID in url 

        @ Route: /api/reviews

            **DELETE** Endpoint - deletes an alarm's review given a JSON containing the review's ID
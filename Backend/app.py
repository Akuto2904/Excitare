import os
import json
from flask import Flask, jsonify, render_template, request, url_for, session, redirect
from sqlalchemy import select, func
from flask_restful import Api, Resource
from models import db, Alarm, User, Review
from auth import require_api_key  # Import middleware from auth.py
from flask_cors import CORS

# Google Calendar Implementation
from datetime import datetime, timedelta 
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

# Password encryption
from cryptography.fernet import Fernet

load_dotenv()

COOKIE_KEY = os.getenv('COOKIE_KEY')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_PROJECT_ID = os.getenv('GOOGLE_PROJECT_ID')
GOOGLE_AUTH_URI = os.getenv('GOOGLE_AUTH_URI')
GOOGLE_TOKEN_URI = os.getenv('GOOGLE_TOKEN_URI')
GOOGLE_AUTH_PROVIDER_X509_CERT_URL = os.getenv('GOOGLE_AUTH_PROVIDER_X509_CERT_URL')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URIS = os.getenv('GOOGLE_REDIRECT_URIS')
GOOGLE_JAVASCRIPT_ORIGINS = os.getenv('GOOGLE_JAVASCRIPT_ORIGINS')

FERNET_KEY=os.getenv('FERNET_KEY')
fernet = Fernet(FERNET_KEY)

clientConfig = {
    "web": {
        "client_id":GOOGLE_CLIENT_ID,
        "project_id":GOOGLE_PROJECT_ID,
        "auth_uri":GOOGLE_AUTH_URI,
        "token_uri":GOOGLE_TOKEN_URI,
        "auth_provider_x509_cert_url":GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        "client_secret":GOOGLE_CLIENT_SECRET,
        "redirect_uris":[GOOGLE_REDIRECT_URIS],
        "javascript_origins":[GOOGLE_JAVASCRIPT_ORIGINS]
    }
}

# Allow Google login from HTTP
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Create a Flask application instance
app = Flask(__name__)
# Used for saving session
app.secret_key = COOKIE_KEY

CORS(app)

# Store the database inside the project directory (database/database.db)
dbFolder = os.path.join(os.getcwd(), "database")
dbPath = os.path.join(dbFolder, "database.db")

# Ensure the database directory exists
os.makedirs(dbFolder, exist_ok=True)

# Configure the SQLite database location
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbPath}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the app
db.init_app(app)

# Set up RESTful API
api = Api(app)

# API Resource for Alarms
class alarmsAPI(Resource):
    
    # GET endpoint method retrieves all alarms from the database
    @require_api_key  # Applies middleware
    def get(self):
        alarms = Alarm.query.all()  # Fetch all alarms from SQLite
        alarmList = []
        if not alarms:
            return jsonify({"error": "not found"}), 404

        # Loop through each alarm and prepare data for JSON response
        for alarm in alarms:
            alarmData = {
                "id": alarm.id,
                "name": alarm.name,
                "description": alarm.description,
                "_links": [
                    {
                    "href": url_for("alarmsapi"),
                    "rel": "all",
                    "method": "GET"
                    },
                    {
                    "href": url_for("alarmsapi"),
                    "rel": "update",
                    "method": "PUT"
                    },
                    {
                    "href": url_for("alarmsapi"),
                    "rel": "delete",
                    "method": "DELETE"
                    },
                    {
                    "href": f"/api/alarm/{alarm.id}",
                    "rel": "new",
                    "method": "POST"
                    },
                    {
                    "href": f"/api/alarm/{alarm.id}",
                    "rel": "this",
                    "method": "GET",
                    },
                    {
                    "href": f"/api/reviews/{alarm.id}",
                    "rel": "reviews",
                    "method": "GET",
                    },
                    {
                    "href": f"/api/reviews/{alarm.id}",
                    "rel": "review",
                    "method": "POST",
                    }
                ]
            }
            alarmList.append(alarmData)

        # Return the alarm list in JSON format
        return jsonify(alarmList)

    # PUT endpoint method to update an existing alarm
    @require_api_key  # Applies middleware
    def put(self):
        alarm = request.json
        alarmId = alarm.get("id")

        matchingAlarm = Alarm.query.get(alarmId)
        if not matchingAlarm:
            return {"error": "Alarm not found"}

        # Update alarm details
        matchingAlarm.id = alarm["id"]
        matchingAlarm.name = alarm["name"]
        matchingAlarm.description = alarm["description"]

        # Commit the changes
        db.session.commit()

        return jsonify(
            {"message": "Alarm updated successfully!",
            "_links": [
                    {
                    "href": f"/api/alarm/{matchingAlarm.id}",
                    "rel": "this",
                    "method": "GET",
                    }
                ]
            
            })
    
    # DELETE method removes an alarm by ID
    @require_api_key  # Applies middleware
    def delete(self):
        alarm = request.json
        if not alarm:
            return jsonify({"error": "not found"}), 404
        
        alarmID = alarm.get("id")

        foundAlarm = Alarm.query.get(alarmID)
        if not foundAlarm:
            return {"error": "Alarm not found"}

        # Delete the alarm and commit changes
        db.session.delete(foundAlarm)
        db.session.commit()

        return {"message": "Alarm deleted successfully!"}

# API Resource for users
class usersAPI(Resource):
    # GET endpoint method retrieves all users from the database
    @require_api_key  # Applies middleware
    def get(self):
        users = User.query.all()  # Fetch all users from SQLite
        userList = []
        if not users:
            return jsonify({"error": "not found"}), 404

        # Loop through each user and prepare data for JSON response
        for user in users:
            userData = {
                "id": user.id,
                "name": user.name,
                "username": user.username,
                "password": user.password,
                "chosenAlarmId": user.chosenAlarmId,
                "_links": [
                    {
                        "href": url_for("usersapi"),
                        "rel": "all",
                        "method": "GET"
                    },
                    {
                        "href": url_for("usersapi"),
                        "rel": "update",
                        "method": "PUT"
                    },
                    {
                        "href": url_for("usersapi"),
                        "rel": "new",
                        "method": "POST"
                    },
                    {
                        "href": url_for("usersapi"),
                        "rel": "delete",
                        "method": "DELETE"
                    },
                    {
                        "href": f"/api/user/{user.id}",
                        "rel": "this",
                        "method": "GET"
                    },
                    {
                        "href": f"/api/alarm/{user.chosenAlarmId}",
                        "rel": "alarm",
                        "method": "GET"
                    }
                ]
            }
            userList.append(userData)

        # Return the user list in JSON format
        return jsonify(userList)

    # PUT endpoint method to update an existing user
    @require_api_key  # Applies middleware
    def put(self):
        user = request.json
        id = user.get("id")

        matchingUser = User.query.get(id)
        if not matchingUser:
            return {"error": "Alarm not found"}

        # Update user details
        if user.get("id"):
            matchingUser.id = user["id"]
        if user.get("name"):
            matchingUser.name = user["name"]
        if user.get("username"):
            matchingUser.username = user["username"]
        if user.get("status"):
            matchingUser.username = user["status"]
        if user.get("role"):
            matchingUser.username = user["role"]
        if user.get("password"):
            matchingUser.password = user["password"]
        if user.get("chosenAlarmId"):
            matchingUser.chosenAlarmId = user["chosenAlarmId"]
        
        # Commit the changes
        db.session.commit()

        return jsonify(
            {"message": "User updated successfully!",
                "_links": [
                    {
                    "href": f"/api/users/{user["id"]}",
                    "rel": "this",
                    "method": "GET",
                    }
                ]
            }
        )
    
    # Posts new user given user JSON
    @require_api_key  # Applies middleware
    def post(self):
        user = request.get_json()

        if (db.session.execute(func.count((User).where(user.id == id)))>0):
            newUser = User(                   # Create a new User instance with the provided data
                id=user["id"],
                name=user["name"],
                username=user["username"],
                password=user["password"],
                chosenAlarmId=user["chosenAlarmId"]
            )
            db.session.add(newUser)            # Add the new user to the database session
            db.session.commit()                 # Commit changes to the database
            return jsonify(
                {"message": "New user added successfully!",
                    "_links": [
                        {
                        "href": f"/api/users/{user["id"]}",
                        "rel": "this",
                        "method": "GET",
                        }
                    ]
                }
            )

        else:
            return jsonify({"error": "User with id already exists"}), 400

    # DELETE method removes an user by ID
    @require_api_key  # Applies middleware
    def delete(self):
        user = request.json
        if not user:
            return jsonify({"error": "not found"}), 404
        
        userID = user.get("id")

        foundUser = User.query.get(userID)
        if not foundUser:
            return {"error": "User not found"}

        # Delete the alarm and commit changes
        db.session.delete(foundUser)
        db.session.commit()

        return {"message": "User deleted successfully!"}

# Register API Endpoint for alarms management
api.add_resource(alarmsAPI, "/api/alarms")
# Register API Endpoint for users management
api.add_resource(usersAPI, "/api/users")


# Setup basic routes for homepage temporarily
@app.route('/')
@require_api_key  # Applies middleware
def index():
    alarms = Alarm.query.all()      # Fetch all alarms from SQLite
    users = User.query.all()        # Fetch all users from SQLite
    reviews = Review.query.all()    # Fetch all reviews from SQLite
    
    return render_template('index.html', alarms=alarms, users=users, reviews=reviews)



# Retrives alarm json given alarm ID in url
@app.route('/api/alarm/<int:id>', methods = ['GET'])
@require_api_key  # Applies middleware
def getAlarm(id):
    row = db.session.execute(select(Alarm).where(Alarm.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    alarm = row[0]
    
    dictAlarm = (alarm.asdict())
    links = {
        "_links": [
            {
            "href": url_for("alarmsapi"),
            "rel": "all",
            "method": "GET"
            },
            {
            "href": url_for("alarmsapi"),
            "rel": "update",
            "method": "PUT"
            },
            {
            "href": url_for("alarmsapi"),
            "rel": "delete",
            "method": "DELETE"
            },
            {
            "href": f"/api/alarm/{alarm.id}",
            "rel": "new",
            "method": "POST"
            },
            {
            "href": f"/api/alarm/{alarm.id}",
            "rel": "this",
            "method": "GET",
            },
            {
            "href": f"/api/reviews/{alarm.id}",
            "rel": "reviews",
            "method": "GET",
            },
            {
            "href": f"/api/reviews/{alarm.id}",
            "rel": "review",
            "method": "POST",
            }
        ]
    }
    
    dictAlarm.update(links)
        
    return jsonify(dictAlarm)

# Posts new given alarm JSON, and given alarm ID in url
@app.route('/api/alarm/<int:id>', methods = ['POST'])
@require_api_key  # Applies middleware
def postAlarm(id):
    alarm = request.get_json()

    if (db.session.execute(func.count((Alarm).where(alarm.id == id)))>0):
        newAlarm = Alarm(                   # Create a new Alarm instance with the provided data
            id=alarm["id"],
            name=alarm["name"],
            description=alarm["description"]
        )
        db.session.add(newAlarm)            # Add the new alarm to the database session
        db.session.commit()                 # Commit changes to the database

        return jsonify(
            {"message": "New alarm added successfully!",
                "_links": [
                    {
                    "href": f"/api/alarm/{alarm["id"]}",
                    "rel": "this",
                    "method": "GET",
                    }
                ]
            }
        )
    else:
        return jsonify({"error": "Alarm with id already exists"}), 400

# given users email and password in a json returns authentication
@app.route('/api/login', methods = ['POST'])
@require_api_key  # Applies middleware
def loginUser():
    loginDetails = request.get_json()
    if not loginDetails:
        return jsonify({"error": "not found"}), 404

    row = db.session.execute(select(User).where(User.email == loginDetails["email"])).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    
    user = row[0]

    decryptedDatabasePass=(fernet.decrypt(bytes.fromhex(user.password))).decode()

    dictUser = (user.asdict())

    if (decryptedDatabasePass==loginDetails["password"]):
        return jsonify({"Details": "Accepted"}, dictUser)
    else:
        return {"Details": "Rejected"}    

# Retrives user json given users ID in url
@app.route('/api/user/<int:id>', methods = ['GET'])
@require_api_key  # Applies middleware
def getUser(id):
    row = db.session.execute(select(User).where(User.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    user = row[0]

    dictUser = (user.asdict())
    
    links = {
        "_links" : [
            {
                "href": url_for("usersapi"),
                "rel": "all",
                "method": "GET"
            },
            {
                "href": url_for("usersapi"),
                "rel": "update",
                "method": "PUT"
            },
            {
                "href": url_for("usersapi"),
                "rel": "new",
                "method": "POST"
            },
            {
                "href": url_for("usersapi"),
                "rel": "delete",
                "method": "DELETE"
            },
            {
                "href": f"/api/user/{dictUser.id}",
                "rel": "this",
                "method": "GET"
            },
            {
                "href": f"/api/alarm/{dictUser.chosenAlarmId}",
                "rel": "alarm",
                "method": "GET"
            }
        ]
    }
    
    dictUser.update(links)
        
    return jsonify(dictUser)



# Retrives user status as json given users ID in url
@app.route('/api/user/<int:id>/status', methods = ['GET'])
@require_api_key  # Applies middleware
def getUserStatus(id):
    row = db.session.execute(select(User).where(User.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    user = row[0]

    dictUser = (user.asdict())
    userStatus = dictUser.status
    
    links = {
        "_links" : [
            {
                "href": url_for("usersapi"),
                "rel": "all",
                "method": "GET"
            },
            {
                "href": url_for("usersapi"),
                "rel": "update",
                "method": "PUT"
            },
            {
                "href": url_for("usersapi"),
                "rel": "new",
                "method": "POST"
            },
            {
                "href": url_for("usersapi"),
                "rel": "delete",
                "method": "DELETE"
            },
            {
                "href": f"/api/user/{dictUser.id}",
                "rel": "this",
                "method": "GET"
            },
            {
                "href": f"/api/alarm/{dictUser.chosenAlarmId}",
                "rel": "alarm",
                "method": "GET"
            }
        ]
    }
        
    return jsonify({"status": userStatus}, links)

# Retrives user json given users username in url
@app.route('/api/user/<string:username>', methods = ['GET'])
@require_api_key  # Applies middleware
def getUserViaUsername(username):
    row = db.session.execute(select(User).where(User.username == username)).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    user = row[0]

    dictUser = (user.asdict())
    
    links = {
        "_links" : [
            {
                "href": url_for("usersapi"),
                "rel": "all",
                "method": "GET"
            },
            {
                "href": url_for("usersapi"),
                "rel": "update",
                "method": "PUT"
            },
            {
                "href": url_for("usersapi"),
                "rel": "new",
                "method": "POST"
            },
            {
                "href": url_for("usersapi"),
                "rel": "delete",
                "method": "DELETE"
            },
            {
                "href": f"/api/user/{dictUser.id}",
                "rel": "this",
                "method": "GET"
            },
            {
                "href": f"/api/alarm/{dictUser.chosenAlarmId}",
                "rel": "alarm",
                "method": "GET"
            }
        ]
    }
    
    dictUser.update(links)
        
    return jsonify(dictUser)

# Retrives an alarm's reviews as json given the alarms ID in url
@app.route('/api/reviews/<int:alarmIdGiven>', methods = ['GET'])
@require_api_key  # Applies middleware
def getAlarmReviews(alarmIdGiven):
    # Returns json containing all the reviews pertaining to the alarm whose alarm id is in the url
    rows = db.session.execute(select(Review).where(Review.alarmId == alarmIdGiven))
    if not rows:
        return jsonify({"error": "not found"}), 404
    x = 0

    reviews = []

    for row in rows:
        reviews.append(row[0].asdict())
    

    links = {
        "_links" : [
            {
                "href": f"/api/reviews/{alarmIdGiven}",
                "rel": "this",
                "method": "GET"
            },
            {
                "href": f"/api/rating/{alarmIdGiven}",
                "rel": "score",
                "method": "GET"
            }]
    }

    reviews.append(links)

    return jsonify(reviews)

# Retrives an alarm's average rating as json given the alarms ID in url
@app.route('/api/rating/<int:alarmIdGiven>', methods = ['GET'])
@require_api_key  # Applies middleware
def getAlarmRating(alarmIdGiven):
    # Returns json containing all the reviews pertaining to the alarm whose alarm id is in the url
    rows = db.session.execute(select(Review.reviewRating).where(Review.alarmId == alarmIdGiven))
    if not rows:
        return jsonify({"error": "not found"}), 404
    x = 0

    reviews = []

    for row in rows:
        reviews.append(row[0])

    noReviews=0
    totalScore=0
    avgScore=0
    for reviewScore in reviews:
        noReviews+=1
        totalScore+=reviewScore
        
    avgScore = round(totalScore/noReviews,1)

    links = {
        "_links" : [
            {
                "href": f"/api/reviews/{alarmIdGiven}",
                "rel": "reviews",
                "method": "GET"
            }]
    }

    #print (f"Score {avgScore}")
    return jsonify({"Score":avgScore}, links)

# Posts new review given json of new review and given the alarms ID in url
@app.route('/api/reviews/<int:alarmIdGiven>', methods = ['POST'])
@require_api_key  # Applies middleware
def postAlarmReview(alarmIdGiven):
    review = request.get_json()
    if not review:
        return jsonify({"error": "not found"}), 404

    if (db.session.execute(func.count((Review).where(review.id == alarmIdGiven)))>0):
        newReview = Review(                     # Create a new review instance with the provided data
            id = review["id"],
            userId = review["userId"],
            alarmId = alarmIdGiven,
            reviewText = review["reviewText"],
            reviewRating = review["reviewRating"]
        )
        db.session.add(newReview)               # Add the new review to the database session
        db.session.commit()                     # Commit changes to the database


        return jsonify({
            "message": "New review added successfully!",
            "_links" : [
                {
                    "href": f"/api/reviews/{alarmIdGiven}",
                    "rel": "reviews",
                    "method": "GET"
                },
                {
                    "href": f"/api/alarm/{alarmIdGiven}",
                    "rel": "alarm",
                    "method": "GET"
                }
            ]
        })
    else:
        return jsonify({"error": "Alarm with id already exists"}), 400
        
# Deletes an alarm's review given a JSON containing the review's ID
@app.route('/api/reviews', methods = ['DELETE'])
@require_api_key  # Applies middleware
def deleteAlarmReview():
        # DELETE method removes a review
        review = request.json
        if not review:
            return jsonify({"error": "not found"}), 404
        
        reviewID = review.get("id")

        foundReview = Review.query.get(reviewID)
        if not foundReview:
            return {"error": "Review not found"}

        # Delete the review and commit changes
        db.session.delete(foundReview)
        db.session.commit()

        return jsonify({
            "message": "Alarm deleted successfully!",
            "_links" : [
                {
                    "href": f"/api/reviews/{reviewID}",
                    "rel": "reviews",
                    "method": "GET"
                }
            ]
        })

# Send user here and itll redirect to google authentication
@app.route('/api/<string:userID>/calendarLogin')
#@require_api_key
def calendarLogin(userID):
    flow = Flow.from_client_config(clientConfig, scopes="https://www.googleapis.com/auth/calendar.readonly")
    flow.redirect_uri = url_for('calendarLoginRedirect', _external=True)

    googleAuth, state = flow.authorization_url(prompt='consent', state=userID, access_type="offline", include_granted_scopes="true")
    session['code_verifier'] = flow.code_verifier
    
    return redirect(googleAuth)


# User is sent here after google authentication, saves credentials to database then redirects
@app.route('/calendarLoginRedirect')
def calendarLoginRedirect():
    userID = request.args.get('state')

    flow = Flow.from_client_config(clientConfig, scopes="https://www.googleapis.com/auth/calendar.readonly")
    flow.redirect_uri = url_for('calendarLoginRedirect', _external=True)
    
    loggedInStatus = request.url
    flow.fetch_token(authorization_response=loggedInStatus, code_verifier=session['code_verifier'])
   
    # Retrieves current user from database
    user = User.query.filter_by(id=userID).first()
    # Assigns current users google refresh token to user in db
    user.refreshToken = flow.credentials.refresh_token
    # Saves refresh token to db
    db.session.commit()


    # Change this return to a redirect to the front end
    return jsonify({"Message": "Log In Success"})

@app.route('/api/<string:userID>/calendars', methods = ['GET'])
@require_api_key
def calendars(userID):

    # Retrieves current user from url and retrieves user from database
    user = User.query.filter_by(id=userID).first()

    # Assembles credentials object using db refresh token 
    sessionCredentials = Credentials(token=None, refresh_token=user.refreshToken, client_id=GOOGLE_CLIENT_ID, client_secret=GOOGLE_CLIENT_SECRET, token_uri=GOOGLE_TOKEN_URI)
    
    try:
        service = build("calendar", "v3", credentials=sessionCredentials)
        allCalendars = service.calendarList().list(fields="items(id,summary)").execute()
        niceOutput = []
        for calendar in allCalendars.get("items", []):
            calendarInfoAsDict={
                    "id" : calendar.get("id"),
                    "summary" : calendar.get("summary")
                }
            niceOutput.append(calendarInfoAsDict)

        return jsonify(niceOutput)
        
    except HttpError as error:
        print(f"An error occurred: {error}")
        return jsonify({(f"An error occurred: {error}")})

# Given a calendarID in a JSON, sets the user in url's chosen calendar
@app.route('/setCalendar/<string:userID>', methods = ['PUT'])
@require_api_key
def setCalendar(userID):
    requestMade = request.json
    givenCalendarID = requestMade.get("id")

    matchingUser = User.query.get(userID)
    if not matchingUser:
        return {"error": "User not found"}

    matchingUser.chosenCalendarID = givenCalendarID

    # Commit the changes
    db.session.commit()

    return jsonify(
        {"message": "User updated successfully!",
            "_links": [
                {
                "href": f"/api/users/{matchingUser.id}",
                "rel": "this",
                "method": "GET",
                },
                {
                "href": f"/api/{matchingUser.id}/firstClass",
                "rel": "this",
                "method": "GET",
                }
            ]
        }
    )

# Retrieves the name and the time of the first event scheduled the next day for the user in url, returns as JSON
@app.route('/api/<string:userID>/firstClass', methods = ['GET'])
@require_api_key
def classTime(userID):
    
    # Retrieves current user from url and retrieves user from database
    user = User.query.filter_by(id=userID).first()
    # Assembles credentials object using db refresh token 
    sessionCredentials = Credentials(token=None, refresh_token=user.refreshToken, client_id=GOOGLE_CLIENT_ID, client_secret=GOOGLE_CLIENT_SECRET, token_uri=GOOGLE_TOKEN_URI)
    
    givenCalendarID=user.chosenCalendarID

    try:
        service = build("calendar", "v3", credentials=sessionCredentials)
        tomorrow = (datetime.now() + timedelta(days=1)).replace(hour=0, minute=0).isoformat() + 'Z'

        classesAsList = service.events().list(calendarId=givenCalendarID, timeMin=tomorrow, maxResults=1, singleEvents=True, orderBy="startTime").execute()
        classes = classesAsList.get("items", [])

        if not classes:
            print("No class tomorrow")
            return jsonify({"message" : "No class tomorrow"},{"status" : 0})

        start = classes[0]["start"].get("dateTime", classes[0]["start"].get("date"))
        classInfo = {
            "startTime" : start,
            "class" : classes[0]["summary"],
            "status" : 1
        }
        
        return jsonify(classInfo)

    except HttpError as error:
        print(f"An error occurred: {error}")
        return jsonify({(f"An error occurred: {error}")})


# When this script(app.py) is run
# Database tables are created before running
if __name__ == '__main__':
    with app.app_context():     # Ensures the Flask application knows we're operating within its context, preventing errors.
        db.create_all()         # Tells SQLAlchemy to create all database tables based on defined models in models.py
        print(f"Database tables created successfully at {dbPath}")
        
    # Run the flask app
    app.run(debug=True)











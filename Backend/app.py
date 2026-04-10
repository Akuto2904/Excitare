import os
from flask import Flask, jsonify, render_template, request, url_for, session, redirect
from sqlalchemy import select
from flask_restful import Api, Resource
from models import db, Alarm, User, Review
from auth import require_api_key
from flask_cors import CORS

# Google Calendar Implementation
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

# Password encryption
from cryptography.fernet import Fernet

load_dotenv()

COOKIE_KEY = os.getenv("COOKIE_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID")
GOOGLE_AUTH_URI = os.getenv("GOOGLE_AUTH_URI")
GOOGLE_TOKEN_URI = os.getenv("GOOGLE_TOKEN_URI")
GOOGLE_AUTH_PROVIDER_X509_CERT_URL = os.getenv("GOOGLE_AUTH_PROVIDER_X509_CERT_URL")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URIS = os.getenv("GOOGLE_REDIRECT_URIS")
GOOGLE_JAVASCRIPT_ORIGINS = os.getenv("GOOGLE_JAVASCRIPT_ORIGINS")

FERNET_KEY = os.getenv("FERNET_KEY")
fernet = Fernet(FERNET_KEY)

clientConfig = {
    "web": {
        "client_id": GOOGLE_CLIENT_ID,
        "project_id": GOOGLE_PROJECT_ID,
        "auth_uri": GOOGLE_AUTH_URI,
        "token_uri": GOOGLE_TOKEN_URI,
        "auth_provider_x509_cert_url": GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uris": [GOOGLE_REDIRECT_URIS],
        "javascript_origins": [GOOGLE_JAVASCRIPT_ORIGINS],
    }
}

# Allow Google login from HTTP
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Create a Flask application instance
app = Flask(__name__)
app.secret_key = COOKIE_KEY

CORS(app)

# Store the database inside the project directory (database/database.db)
dbFolder = os.path.join(os.getcwd(), "database")
dbPath = os.path.join(dbFolder, "database.db")

# Ensure the database directory exists
os.makedirs(dbFolder, exist_ok=True)

# Configure the SQLite database location
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{dbPath}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the database with the app
db.init_app(app)

# Set up RESTful API
api = Api(app)


# API Resource for Alarms
class alarmsAPI(Resource):
    @require_api_key
    def get(self):
        alarms = Alarm.query.all()
        if not alarms:
            return jsonify({"error": "not found"}), 404

        alarmList = []
        for alarm in alarms:
            alarmData = {
                "id": alarm.id,
                "name": alarm.name,
                "description": alarm.description,
                "_links": [
                    {
                        "href": url_for("alarmsapi"),
                        "rel": "all",
                        "method": "GET",
                    },
                    {
                        "href": url_for("alarmsapi"),
                        "rel": "update",
                        "method": "PUT",
                    },
                    {
                        "href": url_for("alarmsapi"),
                        "rel": "delete",
                        "method": "DELETE",
                    },
                    {
                        "href": f"/api/alarm/{alarm.id}",
                        "rel": "new",
                        "method": "POST",
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
                    },
                ],
            }
            alarmList.append(alarmData)

        return jsonify(alarmList)

    @require_api_key
    def put(self):
        alarm = request.get_json()
        if not alarm:
            return jsonify({"error": "not found"}), 404

        alarmId = alarm.get("id")
        matchingAlarm = Alarm.query.get(alarmId)
        if not matchingAlarm:
            return jsonify({"error": "Alarm not found"}), 404

        if alarm.get("name") is not None:
            matchingAlarm.name = alarm["name"]
        if alarm.get("description") is not None:
            matchingAlarm.description = alarm["description"]

        db.session.commit()

        return jsonify(
            {
                "message": "Alarm updated successfully!",
                "_links": [
                    {
                        "href": f"/api/alarm/{matchingAlarm.id}",
                        "rel": "this",
                        "method": "GET",
                    }
                ],
            }
        )

    @require_api_key
    def delete(self):
        alarm = request.get_json()
        if not alarm:
            return jsonify({"error": "not found"}), 404

        alarmID = alarm.get("id")
        foundAlarm = Alarm.query.get(alarmID)
        if not foundAlarm:
            return jsonify({"error": "Alarm not found"}), 404

        db.session.delete(foundAlarm)
        db.session.commit()

        return jsonify({"message": "Alarm deleted successfully!"})

# Other Alarm Endpoints 

# Retrieves alarm json given alarm ID in url
@app.route("/api/alarm/<int:id>", methods=["GET"])
@require_api_key
def getAlarm(id):
    row = db.session.execute(select(Alarm).where(Alarm.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404

    alarm = row[0]
    dictAlarm = alarm.asdict()

    links = {
        "_links": [
            {
                "href": url_for("alarmsapi"),
                "rel": "all",
                "method": "GET",
            },
            {
                "href": url_for("alarmsapi"),
                "rel": "update",
                "method": "PUT",
            },
            {
                "href": url_for("alarmsapi"),
                "rel": "delete",
                "method": "DELETE",
            },
            {
                "href": f"/api/alarm/{alarm.id}",
                "rel": "new",
                "method": "POST",
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
            },
        ]
    }

    dictAlarm.update(links)
    return jsonify(dictAlarm)

# Posts new given alarm JSON, and given alarm ID in url
@app.route("/api/alarm/<int:id>", methods=["POST"])
@require_api_key
def postAlarm(id):
    alarm = request.get_json()
    if not alarm:
        return jsonify({"error": "not found"}), 404

    existingAlarm = Alarm.query.get(id)
    if existingAlarm:
        return jsonify({"error": "Alarm with id already exists"}), 400

    newAlarm = Alarm(
        id=alarm["id"],
        name=alarm["name"],
        description=alarm["description"],
    )
    db.session.add(newAlarm)
    db.session.commit()

    return jsonify(
        {
            "message": "New alarm added successfully!",
            "_links": [
                {
                    "href": f"/api/alarm/{newAlarm.id}",
                    "rel": "this",
                    "method": "GET",
                }
            ],
        }
    )

# Retrieves an alarm's average rating as json given the alarms ID in url
@app.route("/api/rating/<int:alarmIdGiven>", methods=["GET"])
@require_api_key
def getAlarmRating(alarmIdGiven):
    rows = db.session.execute(
        select(Review.reviewRating).where(Review.alarmId == alarmIdGiven)
    ).scalars().all()

    if len(rows) == 0:
        return jsonify(
            {
                "Score": 0,
                "_links": [
                    {
                        "href": f"/api/reviews/{alarmIdGiven}",
                        "rel": "reviews",
                        "method": "GET",
                    }
                ],
            }
        )

    avgScore = round(sum(rows) / len(rows), 1)

    return jsonify(
        {
            "Score": avgScore,
            "_links": [
                {
                    "href": f"/api/reviews/{alarmIdGiven}",
                    "rel": "reviews",
                    "method": "GET",
                }
            ],
        }
    )


# API Resource for users
class usersAPI(Resource):
    @require_api_key
    def get(self):
        users = User.query.all()
        if not users:
            return jsonify({"error": "not found"}), 404

        userList = []
        for user in users:
            userData = {
                "id": user.id,
                "name": user.name,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "chosenAlarmId": user.chosenAlarmId,
                "_links": [
                    {
                        "href": url_for("usersapi"),
                        "rel": "all",
                        "method": "GET",
                    },
                    {
                        "href": url_for("usersapi"),
                        "rel": "update",
                        "method": "PUT",
                    },
                    {
                        "href": url_for("usersapi"),
                        "rel": "new",
                        "method": "POST",
                    },
                    {
                        "href": url_for("usersapi"),
                        "rel": "delete",
                        "method": "DELETE",
                    },
                    {
                        "href": f"/api/user/{user.id}",
                        "rel": "this",
                        "method": "GET",
                    },
                    {
                        "href": f"/api/alarm/{user.chosenAlarmId}",
                        "rel": "alarm",
                        "method": "GET",
                    },
                ],
            }
            userList.append(userData)

        return jsonify(userList)

    @require_api_key
    def put(self):
        user = request.get_json()
        if not user:
            return jsonify({"error": "not found"}), 404

        user_id = user.get("id")
        matchingUser = User.query.get(user_id)
        if not matchingUser:
            return jsonify({"error": "User not found"}), 404

        if user.get("name") is not None:
            matchingUser.name = user["name"]
        if user.get("username") is not None:
            matchingUser.username = user["username"]
        if user.get("email") is not None:
            matchingUser.email = user["email"]
        if user.get("status") is not None:
            matchingUser.status = user["status"]
        if user.get("role") is not None:
            matchingUser.role = user["role"]
        if user.get("password") is not None and user["password"] != "":
            matchingUser.password = fernet.encrypt(user["password"].encode()).hex()
        if user.get("chosenAlarmId") is not None:
            matchingUser.chosenAlarmId = user["chosenAlarmId"]

        db.session.commit()

        return jsonify(
            {
                "message": "User updated successfully!",
                "_links": [
                    {
                        "href": f"/api/user/{matchingUser.id}",
                        "rel": "this",
                        "method": "GET",
                    }
                ],
            }
        )

    @require_api_key
    def post(self):
        user = request.get_json()
        if not user:
            return jsonify({"error": "not found"}), 404

        existingUser = User.query.get(user["id"])
        if existingUser:
            return jsonify({"error": "User with id already exists"}), 400

        encryptedPassword = fernet.encrypt(user["password"].encode()).hex()

        newUser = User(
            id=user["id"],
            name=user["name"],
            username=user["username"],
            email=user["email"],
            role=user.get("role", "user"),
            status=user.get("status", "free"),
            password=encryptedPassword,
            chosenAlarmId=user["chosenAlarmId"],
        )

        db.session.add(newUser)
        db.session.commit()

        return jsonify(
            {
                "message": "New user added successfully!",
                "_links": [
                    {
                        "href": f"/api/user/{newUser.id}",
                        "rel": "this",
                        "method": "GET",
                    }
                ],
            }
        )

    @require_api_key
    def delete(self):
        user = request.get_json()
        if not user:
            return jsonify({"error": "not found"}), 404

        userID = user.get("id")
        foundUser = User.query.get(userID)
        if not foundUser:
            return jsonify({"error": "User not found"}), 404

        db.session.delete(foundUser)
        db.session.commit()

        return jsonify({"message": "User deleted successfully!"})

# Other User Endpoints 

# Retrieves user json given users ID in url
@app.route("/api/user/<int:id>", methods=["GET"])
@require_api_key
def getUser(id):
    row = db.session.execute(select(User).where(User.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404

    user = row[0]
    dictUser = user.asdict()

    links = {
        "_links": [
            {
                "href": url_for("usersapi"),
                "rel": "all",
                "method": "GET",
            },
            {
                "href": url_for("usersapi"),
                "rel": "update",
                "method": "PUT",
            },
            {
                "href": url_for("usersapi"),
                "rel": "new",
                "method": "POST",
            },
            {
                "href": url_for("usersapi"),
                "rel": "delete",
                "method": "DELETE",
            },
            {
                "href": f"/api/user/{dictUser['id']}",
                "rel": "this",
                "method": "GET",
            },
            {
                "href": f"/api/alarm/{dictUser['chosenAlarmId']}",
                "rel": "alarm",
                "method": "GET",
            },
        ]
    }

    dictUser.update(links)
    return jsonify(dictUser)

# Retrieves user status as json given users ID in url
@app.route("/api/user/<int:id>/status", methods=["GET"])
@require_api_key
def getUserStatus(id):
    row = db.session.execute(select(User).where(User.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404

    user = row[0]

    links = {
        "_links": [
            {
                "href": url_for("usersapi"),
                "rel": "all",
                "method": "GET",
            },
            {
                "href": url_for("usersapi"),
                "rel": "update",
                "method": "PUT",
            },
            {
                "href": url_for("usersapi"),
                "rel": "new",
                "method": "POST",
            },
            {
                "href": url_for("usersapi"),
                "rel": "delete",
                "method": "DELETE",
            },
            {
                "href": f"/api/user/{user.id}",
                "rel": "this",
                "method": "GET",
            },
            {
                "href": f"/api/alarm/{user.chosenAlarmId}",
                "rel": "alarm",
                "method": "GET",
            },
        ]
    }

    return jsonify({"status": user.status, "_links": links["_links"]})

# Retrieves user json given users username in url
@app.route("/api/user/<string:username>", methods=["GET"])
@require_api_key
def getUserViaUsername(username):
    row = db.session.execute(select(User).where(User.username == username)).first()
    if not row:
        return jsonify({"error": "not found"}), 404

    user = row[0]
    dictUser = user.asdict()

    links = {
        "_links": [
            {
                "href": url_for("usersapi"),
                "rel": "all",
                "method": "GET",
            },
            {
                "href": url_for("usersapi"),
                "rel": "update",
                "method": "PUT",
            },
            {
                "href": url_for("usersapi"),
                "rel": "new",
                "method": "POST",
            },
            {
                "href": url_for("usersapi"),
                "rel": "delete",
                "method": "DELETE",
            },
            {
                "href": f"/api/user/{dictUser['id']}",
                "rel": "this",
                "method": "GET",
            },
            {
                "href": f"/api/alarm/{dictUser['chosenAlarmId']}",
                "rel": "alarm",
                "method": "GET",
            },
        ]
    }

    dictUser.update(links)
    return jsonify(dictUser)


# Register API endpoints
api.add_resource(alarmsAPI, "/api/alarms")
api.add_resource(usersAPI, "/api/users")


# Review Endpoints

# Retrieves an alarm's reviews as json given the alarms ID in url
@app.route("/api/reviews/<int:alarmIdGiven>", methods=["GET"])
@require_api_key
def getAlarmReviews(alarmIdGiven):
    rows = db.session.execute(select(Review).where(Review.alarmId == alarmIdGiven)).scalars().all()

    reviews = [review.asdict() for review in rows]

    links = {
        "_links": [
            {
                "href": f"/api/reviews/{alarmIdGiven}",
                "rel": "this",
                "method": "GET",
            },
            {
                "href": f"/api/rating/{alarmIdGiven}",
                "rel": "score",
                "method": "GET",
            },
        ]
    }

    reviews.append(links)
    return jsonify(reviews)

# Posts new review given json of new review and given the alarms ID in url
@app.route("/api/reviews/<int:alarmIdGiven>", methods=["POST"])
@require_api_key
def postAlarmReview(alarmIdGiven):
    review = request.get_json()
    if not review:
        return jsonify({"error": "not found"}), 404

    userId = review.get("userId")
    reviewText = review.get("reviewText")
    reviewRating = review.get("reviewRating")

    if userId is None or reviewText is None or reviewRating is None:
        return jsonify({"error": "Missing review fields"}), 400

    review_id = review.get("id")
    if review_id is not None:
        existingReview = Review.query.get(review_id)
        if existingReview:
            return jsonify({"error": "Review with id already exists"}), 400
        newReview = Review(
            id=review_id,
            userId=userId,
            alarmId=alarmIdGiven,
            reviewText=reviewText,
            reviewRating=reviewRating,
        )
    else:
        newReview = Review(
            userId=userId,
            alarmId=alarmIdGiven,
            reviewText=reviewText,
            reviewRating=reviewRating,
        )

    db.session.add(newReview)
    db.session.commit()

    return jsonify(
        {
            "message": "New review added successfully!",
            "_links": [
                {
                    "href": f"/api/reviews/{alarmIdGiven}",
                    "rel": "reviews",
                    "method": "GET",
                },
                {
                    "href": f"/api/alarm/{alarmIdGiven}",
                    "rel": "alarm",
                    "method": "GET",
                },
            ],
        }
    )

# Deletes an alarm's review given a JSON containing the review's ID
@app.route("/api/reviews", methods=["DELETE"])
@require_api_key
def deleteAlarmReview():
    review = request.get_json()
    if not review:
        return jsonify({"error": "not found"}), 404

    reviewID = review.get("id")
    foundReview = Review.query.get(reviewID)
    if not foundReview:
        return jsonify({"error": "Review not found"}), 404

    db.session.delete(foundReview)
    db.session.commit()

    return jsonify(
        {
            "message": "Review deleted successfully!",
            "_links": [
                {
                    "href": f"/api/reviews/{reviewID}",
                    "rel": "reviews",
                    "method": "GET",
                }
            ],
        }
    )


# Login Endpoint

# given users email and password in a json returns authentication
@app.route("/api/login", methods=["POST"])
@require_api_key
def loginUser():
    loginDetails = request.get_json()
    if not loginDetails:
        return jsonify({"error": "not found"}), 404

    email = loginDetails.get("email")
    password = loginDetails.get("password")

    if not email or not password:
        return jsonify({"Details": "Rejected", "error": "Missing email or password"}), 400

    row = db.session.execute(select(User).where(User.email == email)).first()
    if not row:
        return jsonify({"Details": "Rejected"}), 401

    user = row[0]

    try:
        decryptedDatabasePass = fernet.decrypt(bytes.fromhex(user.password)).decode()
    except Exception:
        return jsonify({"Details": "Rejected", "error": "Password decode failed"}), 500

    dictUser = user.asdict()

    if decryptedDatabasePass == password:
        return jsonify(
            {
                "Details": "Accepted",
                "userId": user.id,
                "userRole": user.role,
                "userStatus": user.status,
                "user": dictUser,
            }
        )

    return jsonify({"Details": "Rejected"}), 401


# Google Calendar Integration Endpoints

# Send user here and it'll redirect to google authentication
@app.route("/api/<string:userID>/calendarLogin")
def calendarLogin(userID):
    flow = Flow.from_client_config(
        clientConfig,
        scopes=["https://www.googleapis.com/auth/calendar.readonly"],
    )
    flow.redirect_uri = url_for("calendarLoginRedirect", _external=True)

    googleAuth, state = flow.authorization_url(
        prompt="consent",
        state=userID,
        access_type="offline",
        include_granted_scopes="true",
    )
    session["code_verifier"] = flow.code_verifier

    return redirect(googleAuth)

# User is sent here after google authentication, saves credentials to database then will redirect to the front end
@app.route("/calendarLoginRedirect")
def calendarLoginRedirect():
    userID = request.args.get("state")

    flow = Flow.from_client_config(
        clientConfig,
        scopes=["https://www.googleapis.com/auth/calendar.readonly"],
    )
    flow.redirect_uri = url_for("calendarLoginRedirect", _external=True)

    loggedInStatus = request.url
    flow.fetch_token(
        authorization_response=loggedInStatus,
        code_verifier=session["code_verifier"],
    )

    user = User.query.filter_by(id=userID).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.refreshToken = flow.credentials.refresh_token
    db.session.commit()

    return jsonify({"Message": "Log In Success"})
    # Redirect

# Returns JSON of users google calendars to make a selection with
@app.route("/api/<string:userID>/calendars", methods=["GET"])
@require_api_key
def calendars(userID):
    user = User.query.filter_by(id=userID).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    sessionCredentials = Credentials(
        token=None,
        refresh_token=user.refreshToken,
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        token_uri=GOOGLE_TOKEN_URI,
    )

    try:
        service = build("calendar", "v3", credentials=sessionCredentials)
        allCalendars = service.calendarList().list(fields="items(id,summary)").execute()

        niceOutput = []
        for calendar in allCalendars.get("items", []):
            calendarInfoAsDict = {
                "id": calendar.get("id"),
                "summary": calendar.get("summary"),
            }
            niceOutput.append(calendarInfoAsDict)

        return jsonify(niceOutput)

    except HttpError as error:
        print(f"An error occurred: {error}")
        return jsonify({"error": f"An error occurred: {error}"}), 500

# Given a calendarID in a JSON, sets the user in url's chosen calendar
@app.route("/api/setCalendar/<string:userID>", methods=["PUT"])
@require_api_key
def setCalendar(userID):
    requestMade = request.get_json()
    if not requestMade:
        return jsonify({"error": "not found"}), 404

    givenCalendarID = requestMade.get("id")
    matchingUser = User.query.get(userID)
    if not matchingUser:
        return jsonify({"error": "User not found"}), 404

    matchingUser.chosenCalendarID = givenCalendarID
    db.session.commit()

    return jsonify(
        {
            "message": "User updated successfully!",
            "_links": [
                {
                    "href": f"/api/user/{matchingUser.id}",
                    "rel": "this",
                    "method": "GET",
                },
                {
                    "href": f"/api/{matchingUser.id}/firstClass",
                    "rel": "firstClass",
                    "method": "GET",
                },
            ],
        }
    )

# Retrieves the name and the time of the first event scheduled the next day for the user in url
@app.route("/api/<string:userID>/firstClass", methods=["GET"])
@require_api_key
def classTime(userID):
    user = User.query.filter_by(id=userID).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    sessionCredentials = Credentials(
        token=None,
        refresh_token=user.refreshToken,
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        token_uri=GOOGLE_TOKEN_URI,
    )

    givenCalendarID = user.chosenCalendarID

    try:
        service = build("calendar", "v3", credentials=sessionCredentials)
        tomorrow = (datetime.now() + timedelta(days=1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        ).isoformat() + "Z"

        classesAsList = service.events().list(
            calendarId=givenCalendarID,
            timeMin=tomorrow,
            maxResults=1,
            singleEvents=True,
            orderBy="startTime",
        ).execute()

        classes = classesAsList.get("items", [])

        if not classes:
            return jsonify({"message": "No class tomorrow", "status": 0})

        start = classes[0]["start"].get("dateTime", classes[0]["start"].get("date"))
        classInfo = {
            "startTime": start,
            "class": classes[0]["summary"],
            "status": 1,
        }

        return jsonify(classInfo)

    except HttpError as error:
        print(f"An error occurred: {error}")
        return jsonify({"error": f"An error occurred: {error}"}), 500

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print(f"Database tables created successfully at {dbPath}")

    app.run(debug=True)








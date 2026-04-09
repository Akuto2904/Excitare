from app import app, db
from models import Alarm, User, Review  # Import defined models in models.py
# Password encryption
import os
from cryptography.fernet import Fernet

FERNET_KEY=os.getenv('FERNET_KEY')
fernet = Fernet(FERNET_KEY)

# List of alarms used to populate the database
alarms = [
    {"id": 1, "name": "Happy Alarm", "description": "great"},
    {"id": 2, "name": "Awful Alarm", "description": "aaaahhh"},
    {"id": 3, "name": "Fast Alarm", "description": "Peak"},
    {"id": 4, "name": "Sad Alarm", "description": "sad"},
    {"id": 5, "name": "Triple Alarm", "description": "fantastic"},
    {"id": 6, "name": "Spooky Alarm", "description": "scary"},
    {"id": 7, "name": "Peaceful Alarm", "description": "calm"}
]
# List of reviews used to populate the database
reviews = [
    {"id": 1, "userId": 1, "alarmId": 1, "reviewText": "Wakes me up", "reviewRating": 2},
    {"id": 2, "userId": 2, "alarmId": 1, "reviewText": "Loud", "reviewRating": 8},
    {"id": 3, "userId": 3, "alarmId": 1, "reviewText": "Simple", "reviewRating": 7}
]
# List of users used to populate the database
users = [
    {"id": 1, "name": "John", "username": "J", "password": "123", "chosenAlarmId": 1},
    {"id": 2, "name": "Adam", "username": "A", "password": "123", "chosenAlarmId": 2},
    {"id": 3, "name": "Lorimer", "username": "L", "password": "123", "chosenAlarmId": 3}
]

# Function to preload the database with alarm data
def preloadAlarms():
    with app.app_context():                         # Ensure the database operations run inside the flask app context
        if Alarm.query.count() == 0:                # Check if the Alarm table in the database is empty
            for alarm in alarms:                    # loops through all alarms in the alarms list
                newAlarm = Alarm(                   # Create a new Alarm instance with the provided data
                    id=alarm["id"],
                    name=alarm["name"],
                    description=alarm["description"]
                )
                db.session.add(newAlarm)            # Add the new alarm to the database session
            db.session.commit()                     # Commit changes to the database
            
            print("Database populated with initial alarms successfully")
        else:
            print("Database already contains alarm data. No changes made.")

# Function to preload the database with review data
def preloadReviews():
    with app.app_context():                             # Ensure the database operations run inside the flask app context
        if Review.query.count() == 0:                   # Check if the Review table in the database is empty
            for review in reviews:                      # loops through all reviews in the reviews list
                newReview = Review(                     # Create a new Review instance with the provided data
                    id=review["id"],
                    userId=review["userId"],
                    alarmId=review["alarmId"],
                    reviewText=review["reviewText"],
                    reviewRating=review["reviewRating"]
                )
                db.session.add(newReview)               # Add the new review to the database session
            db.session.commit()                         # Commit changes to the database
            
            print("Database populated with initial reviews successfully")
        else:
            print("Database already contains review data. No changes made.")

# Function to preload the database with user data
def preloadUsers():
    with app.app_context():                         # Ensure the database operations run inside the flask app context
        if User.query.count() == 0:                 # Check if the User table in the database is empty
            for user in users:                      # loops through all users in the users list
                encryptedPassword = fernet.encrypt((user["password"]).encode()) # encrypts password
                newUser = User(                     # Create a new User instance with the provided data
                    id=user["id"],
                    name=user["name"],
                    username=user["username"],
                    password=encryptedPassword.hex(),
                    chosenAlarmId=user["chosenAlarmId"]
                )
                db.session.add(newUser)                 # Add the new user to the database session
            db.session.commit()                         # Commit changes to the database
            
            print("Database populated with initial users successfully")
        else:
            print("Database already contains user data. No changes made.")


preloadAlarms()                         # Calls the Alarm table creation function
preloadReviews()                        # Calls the Review table creation function
preloadUsers()                          # Calls the User table creation function
import os
from flask import Flask, jsonify, render_template, request
from sqlalchemy import select, func
from flask_restful import Api, Resource
from models import db, Alarm, User, Review

# Create a Flask application instance
app = Flask(__name__)

# Store the database inside the project directory (database/database.db)
db_folder = os.path.join(os.getcwd(), "database")
db_path = os.path.join(db_folder, "database.db")

# Ensure the database directory exists
os.makedirs(db_folder, exist_ok=True)

# Configure the SQLite database location
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the app
db.init_app(app)

# Set up RESTful API
api = Api(app)

# API Resource for Alarms
class alarmsAPI(Resource):
    # GET endpoint method retrieves all alarms from the database
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
            }
            alarmList.append(alarmData)

        # Return the alarm list in JSON format
        return jsonify(alarmList)

    # PUT endpoint method to update an existing alarm
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

        return {"message": "Alarm updated successfully!"}
    
    # DELETE method removes an alarm by ID
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
                "chosenAlarmId": user.chosenAlarmId
            }
            userList.append(userData)

        # Return the user list in JSON format
        return jsonify(userList)

    # PUT endpoint method to update an existing user
    def put(self):
        user = request.json
        id = user.get("id")

        matchingUser = User.query.get(id)
        if not matchingUser:
            return {"error": "Alarm not found"}

        # Update user details
        matchingUser.id = user["id"]
        matchingUser.name = user["name"]
        matchingUser.username = user["username"]
        matchingUser.password = user["password"]
        matchingUser.chosenAlarmId = user["chosenAlarmId"]

        # Commit the changes
        db.session.commit()

        return {"message": "User updated successfully!"}
    
    # DELETE method removes an user by ID
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
def index():
    alarms = Alarm.query.all()      # Fetch all alarms from SQLite
    users = User.query.all()        # Fetch all users from SQLite
    reviews = Review.query.all()    # Fetch all reviews from SQLite
    
    return render_template('index.html', alarms=alarms, users=users, reviews=reviews)

# Retrives alarm json given alarm ID in url
@app.route('/api/alarm/<int:id>', methods = ['GET'])
def getAlarm(id):
    row = db.session.execute(select(Alarm).where(Alarm.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    alarm = row[0]
    return jsonify(alarm.asdict())

# Posts new given alarm JSON, and given alarm ID in url
@app.route('/api/alarm/<int:id>', methods = ['POST'])
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
        return {"message": "New alarm added successfully!"}
    else:
        return jsonify({"error": "Alarm with id already exists"}), 400

# Retrives user json given users ID in url
@app.route('/api/user/<int:id>', methods = ['GET'])
def getUser(id):
    row = db.session.execute(select(User).where(User.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    user = row[0]
    return jsonify(user.asdict())

# Retrives user json given users ID in url
@app.route('/api/user/<string:username>', methods = ['GET'])
def getUserViaUsername(username):
    row = db.session.execute(select(User).where(User.username == username)).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    user = row[0]
    return jsonify(user.asdict())

# Retrives an alarm's reviews as json given the alarms ID in url
@app.route('/api/reviews/<int:alarmIdGiven>', methods = ['GET'])
def getAlarmReviews(alarmIdGiven):
    # Returns json containing all the reviews pertaining to the alarm whose alarm id is in the url
    rows = db.session.execute(select(Review).where(Review.alarmId == alarmIdGiven))
    if not rows:
        return jsonify({"error": "not found"}), 404
    x = 0

    reviews = []

    for row in rows:
        reviews.append(row[0].asdict())
    
    return jsonify(reviews)

# Posts new review given json of new review and given the alarms ID in url
@app.route('/api/reviews/<int:alarmIdGiven>', methods = ['POST'])
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
        )
        db.session.add(newReview)               # Add the new review to the database session
        db.session.commit()                     # Commit changes to the database
        return {"message": "New review added successfully!"}
    else:
        return jsonify({"error": "Alarm with id already exists"}), 400
        
# Deletes an alarm's review given a JSON containing the review's ID
@app.route('/api/reviews', methods = ['DELETE'])
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

        return {"message": "Alarm deleted successfully!"}

# When this script(app.py) is run
# Database tables are created before running
if __name__ == '__main__':
    with app.app_context():     # Ensures the Flask application knows we're operating within its context, preventing errors.
        db.create_all()         # Tells SQLAlchemy to create all database tables based on defined models in models.py
        print(f"Database tables created successfully at {db_path}")
        
    # Run the flask app
    app.run(debug=True)











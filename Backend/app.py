import os
from flask import Flask, jsonify, render_template, request
from sqlalchemy import select, func
from flask_restful import Api, Resource
from models import db, Alarm, User, Review
#curl -X POST -H "Content-Type: application/json" -d '{"id": 8, "name": "new cool Alarm", "description": "great and new"}' http://localhost:127.0.0.1:8000/api/alarms
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



# Register API Endpoint
api.add_resource(alarmsAPI, "/api/alarms")


#Setup basic routes
@app.route('/')
def index():
    alarms = Alarm.query.all()  # Fetch all alarms from SQLite
    users = User.query.all()  # Fetch all users from SQLite
    reviews = Review.query.all()  # Fetch all reviews from SQLite
    
    return render_template('index.html', alarms=alarms, users=users, reviews=reviews)

@app.route('/api/alarm/<int:id>', methods = ['GET'])
def getAlarm(id):
    row = db.session.execute(select(Alarm).where(Alarm.id == id)).first()
    if not row:
        return jsonify({"error": "not found"}), 404
    alarm = row[0]
    return jsonify(alarm.asdict())

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
        
    # Run the flask app at host='0.0.0.0', port=8000
    #app.run(debug=True, host='0.0.0.0', port=8000)
    app.run(debug=True)











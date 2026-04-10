from flask_sqlalchemy import SQLAlchemy

# Set up SQLAlchemy
# Initialize the database (without linking to app)
db = SQLAlchemy()

# Used to represent the alarm table's data in database
class Alarm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    # Used to convert the object into a dictionary type allowing easy json conversion
    def asdict(self):
        return {'id': self.id, 'name': self.name, 'description': self.description}
    
# Used to represent the user table's data in database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(5), nullable=False, default="user")
    status = db.Column(db.String(8), nullable=False, default="free")
    password = db.Column(db.String(200), nullable=False)
    refreshToken = db.Column(db.String(1000), nullable=False, default="none")
    chosenCalendarID = db.Column(db.String(200), nullable=False, default="none")
    chosenAlarmId = db.Column(db.Integer, nullable=False, default="none")
    # Used to convert the object into a dictionary type allowing easy json conversion
    def asdict(self):
        return {'id': self.id, 'name': self.name, 'username': self.username, 'email':self.email, 'role': self.role, 'status': self.status, 'chosenAlarmId' : self.chosenAlarmId}

# Used to represent the review table's data in database
class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey("user.id"))
    alarmId = db.Column(db.Integer, db.ForeignKey("alarm.id"))
    reviewText = db.Column(db.String(100), nullable=False)
    reviewRating = db.Column(db.Integer, nullable=False)
    # Used to convert the object into a dictionary type allowing easy json conversion
    def asdict(self):
        return {'id': self.id, 'userId': self.userId, 'alarmId': self.alarmId, 'reviewText': self.reviewText, 'reviewRating' : self.reviewRating}

# Used for Middleware
class APIKey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), unique=True, nullable=False)
    owner = db.Column(db.String(50), nullable=False)
    request_count = db.Column(db.Integer, default=0)
    rate_limit = db.Column(db.Integer, default=1000)

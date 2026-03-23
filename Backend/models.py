from flask_sqlalchemy import SQLAlchemy

# Set up SQLAlchemy
# Initialize the database (without linking to app)
db = SQLAlchemy()

class Alarm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey("user.id"))
    alarmId = db.Column(db.Integer, db.ForeignKey("alarm.id"))
    reviewText = db.Column(db.String(100), nullable=False)

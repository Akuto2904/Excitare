from app import app, dbPath
from models import db # Import prelinked SQLAlchemy db app created in in models.py

def create_tables():            # Function that creates tables in the db based on the models defined in models.py
    with app.app_context():     # Ensures the Flask application knows we're operating within its context, preventing errors.
        db.create_all()         # Tells SQLAlchemy to create all database tables based on defined models in models.py
        print(f"Database tables created successfully at {dbPath}")

create_tables()                 # Calls the table creation function
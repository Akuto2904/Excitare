from functools import wraps
from flask import request, jsonify
from models import APIKey

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from app import app, db  # Import inside function to avoid circular import
        
        apiKeyGiven = request.headers.get('X-API-KEY')

        with app.app_context():
            keyEntry = APIKey.query.filter_by(key=apiKeyGiven).first()

            # If API key is invalid or not provided
            if not keyEntry:
                return {"error": "Invalid or missing API key."}, 403

            # Optional: Update request_count here for future rate-limiting
            keyEntry.request_count += 1
            db.session.commit()

        return f(*args, **kwargs)

    return decorated_function

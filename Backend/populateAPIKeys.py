import secrets
from app import app, db
from models import APIKey

apiKeys = [
    {"owner": "Frontend App"},
    {"owner": "Backend App"},
    {"owner": "Public User"},
]

with app.app_context():
    for entry in apiKeys:
        newKey = APIKey(
            key=secrets.token_hex(32),  # Generates a secure random API key
            owner=entry["owner"],
            rate_limit=1000  # Set default rate limit
        )
        db.session.add(newKey)

    db.session.commit()
    print("API Keys successfully created and stored in the database.")

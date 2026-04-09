import sqlite3

# Database file
DB_FILE = "./database/database.db"

# Connect to db
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Fetch all rows from the api_key table
try:
    cursor.execute("SELECT * FROM api_key")
    rows = cursor.fetchall()

    if not rows:
        print("No API keys found in the database.")
    else:
        # Print column headers
        columnNames = [description[0] for description in cursor.description]
        print(" | ".join(columnNames))

        # Print each row
        for row in rows:
            print(" | ".join(str(value) for value in row))

except sqlite3.Error as e:
    print(f"Database error: {e}")

# Close the connection
conn.close()

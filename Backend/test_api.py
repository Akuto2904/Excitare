import requests
# All print statements require the -s flag to run
# Tests command: python -m pytest -v
# Tests with print statements: python -m pytest -v -s

# API Endpoint and Key
ENDPOINT = "http://127.0.0.1:5000"
API_KEY = "67c5ef055c88bf1e93e29da4564986bdf1e2b2ddca99e0353e95a8a580587f17"

# Headers
HEADERS = {
    "Content-Type" : "application/json",
    "X-API-KEY" : API_KEY
}


# Tests will use alarm 1 and user 1
# All Paths

# Alarm Endpoint Paths
ALARMS_PATH = "/api/alarms"
ALARM_PATH = "/api/alarm/1"
ALARM_PATH_TO_CREATE = "/api/alarm/20"
ALARM_RATING_PATH = "/api/rating/1"

# User Endpoint Paths
USERS_PATH = "/api/users"
USER_PATH = "/api/user/5"
USER_USERNAME_PATH = "/api/user/JohnCoolNewUsername"
USER_STATUS_PATH = "/api/user/5/status"

# Review Endpoint Paths
REVIEW_PATH_TO_CREATE = "/api/reviews/1"
REVIEWS_PATH = "/api/reviews"

# Login Endpoint Path
LOGIN_PATH = "/api/login"

# Google Calendar Integration Paths - User 1 is already logged in
G_CALENDAR = "/api/1/calendars"
G_CALENDAR_SET = "/api/setCalendar/1"
G_CALENDAR_CLASS = "/api/1/firstClass"



# Payloads
# Alarm Payloads
ALARM_POST_PAYLOAD = {
    "name" : "New Alarm thats cool",
    "description" : "Awesome Description",
}
ALARM_PUT_PAYLOAD = {
    "id" : 20,
    "description" : "Even More Awesome than before",
}
ALARM_DELETE_PAYLOAD = {
    "id" : 20
}

# Login Payloads
LOGIN_POST_PAYLOAD = {
    "email" : "testemail1@gmail.com",
    "password" : "123"
}

# Review Payloads
REVIEW_POST_PAYLOAD = {
  "reviewRating": 2,
  "reviewText": "Cool Stuff",
  "userId": 1,
  "id": 30
}
REVIEW_DELETE_PAYLOAD = {
  "id": 30,
}

# Google Calendar Payloads
CALENDAR_PUT_PAYLOAD = {
  "id": "806170175333c3d1c9149f4071b835f47026b8e4c6a5272eae649a68a4a12202@group.calendar.google.com"
}

# Users Payloads
USER_POST_PAYLOAD = {
  "chosenAlarmId": 1,
  "email": "testemail5@gmail.com",
  "id": 5,
  "name": "JohnCool",
  "password": "123",
  "role": "user",
  "status": "free",
  "username": "JohnCool"
}
USER_PUT_PAYLOAD = {
  "chosenAlarmId": 4,
  "id": 5,
  "name": "JohnCoolNewName",
  "password": "123",
  "role": "user",
  "status": "free",
  "username": "JohnCoolNewUsername"
}
USER_DELETE_PAYLOAD = {
  "id": 5
}

# Alarm Tests
# Get all alarms
def test_get_alarms_endpoint():
    response = requests.get(ENDPOINT + ALARMS_PATH, headers=HEADERS)
    print(response.text)

    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# POST to an alarm that already exists
def test_post_alarm_exists_already_endpoint():
    response = requests.post(ENDPOINT + ALARM_PATH, headers=HEADERS, json=ALARM_POST_PAYLOAD)
    print(response.text)
    # Assume rejected due to ID response, if not 400 then fail
    assert response.status_code == 400 

# POST new alarm that doesnt exist
def test_post_alarm_new_endpoint():
    response = requests.post(ENDPOINT + ALARM_PATH_TO_CREATE, headers=HEADERS, json=ALARM_POST_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200 

# PUT to update new alarm
def test_alarm_put_endpoint():
    response = requests.put(ENDPOINT + ALARMS_PATH, headers=HEADERS, json=ALARM_PUT_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200 

# GET new alarm details
def test_get_new_alarm_endpoint():
    response = requests.get(ENDPOINT + ALARM_PATH_TO_CREATE, headers=HEADERS)
    print(response.text)

    # Test data really changed after PUT
    data = response.json()
    assert data["description"] == ALARM_PUT_PAYLOAD["description"]
    
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# Delete alarm
def test_delete_new_alarm_endpoint():
    response = requests.delete(ENDPOINT + ALARMS_PATH, headers=HEADERS, json=ALARM_DELETE_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# Get alarm that doesnt exist as its now deleted
def test_get_deleted_alarm_endpoint():
    response = requests.get(ENDPOINT + ALARM_PATH_TO_CREATE, headers=HEADERS)
    print(response.text)
    # Assume rejected response, if not 404 then fail
    assert response.status_code == 404

# Get alarm average rating
def test_get_average_rating_of_alarm_endpoint():
    response = requests.get(ENDPOINT + ALARM_RATING_PATH, headers=HEADERS)
    print(response.text)
    # Assume rejected response, if not 200 then fail
    assert response.status_code == 200

# Login Tests
# Login Endpoint Test
def test_can_login():
    response = requests.post(ENDPOINT + LOGIN_PATH, headers=HEADERS, json=LOGIN_POST_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# Reviews Tests
# POST review test
def test_post_review():
    response = requests.post(ENDPOINT + REVIEW_PATH_TO_CREATE, headers=HEADERS, json=REVIEW_POST_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# GET reviews test
def test_get_reviews():
    response = requests.get(ENDPOINT + REVIEW_PATH_TO_CREATE, headers=HEADERS)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# DELETE review test
def test_delete_review():
    response = requests.delete(ENDPOINT + REVIEWS_PATH, headers=HEADERS, json=REVIEW_DELETE_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# Calendar Tests
# PUT set calendar
def test_set_calendar():
    response = requests.put(ENDPOINT + G_CALENDAR_SET, headers=HEADERS, json=CALENDAR_PUT_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# GET Calendars
def test_get_calendar():
    response = requests.get(ENDPOINT + G_CALENDAR, headers=HEADERS)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# GET first Class
def test_get_class():
    response = requests.get(ENDPOINT + G_CALENDAR_CLASS, headers=HEADERS)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# User Tests
# Get all users
def test_get_users_endpoint():
    response = requests.get(ENDPOINT + USERS_PATH, headers=HEADERS)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# POST new user
def test_post_user_new_endpoint():
    response = requests.post(ENDPOINT + USERS_PATH, headers=HEADERS, json=USER_POST_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200 

# PUT to new update user
def test_user_put_endpoint():
    response = requests.put(ENDPOINT + USERS_PATH, headers=HEADERS, json=USER_PUT_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200 

# GET new user details by id
def test_get_new_user_by_id_endpoint():
    response = requests.get(ENDPOINT + USER_PATH, headers=HEADERS)
    print(response.text)

    # Test data really changed after PUT
    data = response.json()
    assert data["name"] == USER_PUT_PAYLOAD["name"]
    
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200
    
# GET new user details by username
def test_get_new_user_by_username_endpoint():
    response = requests.get(ENDPOINT + USER_USERNAME_PATH, headers=HEADERS)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# GET new user details by username
def test_get_new_users_status_endpoint():
    response = requests.get(ENDPOINT + USER_STATUS_PATH, headers=HEADERS)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# Delete user
def test_delete_new_user_endpoint():
    response = requests.delete(ENDPOINT + USERS_PATH, headers=HEADERS, json=USER_DELETE_PAYLOAD)
    print(response.text)
    # Assume approved response, if not 200 then fail
    assert response.status_code == 200

# Get alarm that doesnt exist as its now deleted
def test_get_deleted_user_by_id_endpoint():
    response = requests.get(ENDPOINT + USER_PATH, headers=HEADERS)
    print(response.text)
    # Assume rejected response, if not 404 then fail
    assert response.status_code == 404
# Get alarm that doesnt exist as its now deleted

def test_get_deleted_user_by_username_endpoint():
    response = requests.get(ENDPOINT + USER_USERNAME_PATH, headers=HEADERS)
    print(response.text)
    # Assume rejected response, if not 404 then fail
    assert response.status_code == 404

# Get alarm that doesnt exist as its now deleted
def test_get_deleted_user_status_endpoint():
    response = requests.get(ENDPOINT + USER_STATUS_PATH, headers=HEADERS)
    print(response.text)
    # Assume rejected response, if not 404 then fail
    assert response.status_code == 404
Authentication, authorization, users
====================================

Authentication
--------------

All requests must be authenticated. The users must log in to create and get a session id token used for authenticating the later requests: token will be passed in the request header field `X-Authorization` as follows:

```
X-Authorization: Bearer {token}
``` 

Where `{token}` represents the session id as present in the sessions table.


For development purposes you can alternatively pass the token in the GET url like this:
```
curl 'http://127.0.0.1:5000/api/nodes?token=test&limit=2
```
Moreover, in the development mode the token value "test" grants superuser rights. The development mode is
controlled at the top of the server/webapi/webapi_common.py source file as these values in the Request class:
```
  authentication=True # False only for debugging: will not require auth token
  test_auth=True # MUST set to False for production: True means session-id "test" is always superuser
```

User types and rights
----------------------


User type is specified in user field `level`. User type can be:

* `1` - Superuser. User is able to use full functionality of the WSN Monitor UI and API without any restrictions.
* `0` - Standard user. User rights will be restricted based by the user `networks` field.

Standard user rights will be determined by the user's `networks` field. User is able to see only those networks listed 
in his `networks` field. In this field there will be specified user role for each accessible network separately.

User role can be one of:

* `2` - Network administrator. User will have the following rights:
    - User is able to see the full data of the network
    - User is able to see all users assigned to this network    
* `1` - Network user. User will have the following rights:
    - User is able to see the full data of the network 
* `0` - Blocked user. User does not have access to this network (but this can be changed by the network admin user)


Supported methods
-----------------


### Auth

Used for authentication.

#### Authenticate user and create new session

URL: `POST https://{server}/api/auth`

Request body:

```json
{
  "resource": {
    "username": "john.smith@mynetwork.com",
    "password": "@#$#@"
  }
}
```

Response body:

```json
{
  "resource": {
    "id": 1,
    "username": "john.smith@mynetwork.com",
    "sid": "43564326456456455234532453245345432543253454325645645264564234275676575676457564754",
    "created": "2018-05-21T15:43:21",
    "endts": "2018-05-22T15:43:21",
    "user": {
        "id": 2,
        "username": "john.smith@mynetwork.com",
        "first_name": "John",
        "last_name": "Smith",
        "phone": "123-343-223432",
        "address": "",
        "level": 0,
        "networks" : {
            "1": 0,
            "2": 2,
            "3": 1
        },
        "last_login": "2018-05-04T16:32:26",
        "status": "B"
    }
  }
}
```

Response element `sid` value should be used as authentication token for all other requests.

This method is allowed for all users. If user authentication fails (that is - there is no user with specified email 
and password) or if user is in blocked state then this method returns error response.

Internally this method creates new session resource and returns this data and also corresponding user record in `user` element.

#### Logout

URL: `DELETE https://{server}/api/auth/{sid}`

This method is allowed for all users.

Internally this method sets session resource status as deleted based by provided session `sid` value.

### Users

Resource base URL: `https://{server}/api/users`

Resource structure:

```json
{
  "id": 1,
  "username": "john.smith@mynetwork.com",
  "first_name": "John",
  "last_name": "Smith",
  "phone": "123-343-223432",
  "address": "",
  "password": "@#$#@$",
  "level": 0,
  "networks" : {
    "1": 0,
    "2": 2,
    "3": 1
  },
  "last_login": "2018-05-04T16:32:26",
  "status": "B"
}
```

Elements:
* `username`: User e-mail address
* `first_name`: First name
* `last_name`: Last name
* `phone`: User phone
* `address`: User address
* `password`: User password (write only, for authenticating password change)
* `level`: User level, one of:
    - 0 - standard user
    - 1 - superuser (unlimited access to all data in all networks)
* `networks`: JSON object containing information about what networks the user can access.
   Object keys correspond to the network ID in network table. Value can be one of:
   - 0 - no access (user is manageable by admin of this network)
   - 1 - standard user access (view-only access)
   - 2 - admin access (can view users for this network)
* `last_login`: Last login timestamp
* `status`: One of:
    - A - active (user can log in)
    - B - blocked (user can't log in)
    - D - deleted (user can't log in and is also hidden from user list, only superuser can see)

Superuser can see and update all users (including password), as well as add new users.

Admin of a network can see all users of the network she is an admin of, but cannot change any values
or add new users.

Standard user cannot see or change other users and cannot add new users. Standard user can change
her password (see the "change password" operation below) and change the informational fields ("first_name","last_name","phone","email","address") of her own account.

#### Change password

URL: `PUT https://{server}/api/users/{id}`

Method body:

```json
{
  "resource": {
    "password": oldPassword,
    "new_password": password
  }
}
```

Allowed for all users if the user ID corresponds to the current user and provided old password matches to the user's 
current password.

### Sessions

Resource base URL: `https://{server}/api/sessions`

Resource structure:
```json
{
  "username": "test2",
  "created_at": "2018-07-08T01:23:52",
  "token": null,
  "endts": "2020-01-20T17:08:31",
  "sid": "test2sessionsid",
  "id": 1
}
```

Only superuser can see the sessions. The relevant fields are "sid" and "username".


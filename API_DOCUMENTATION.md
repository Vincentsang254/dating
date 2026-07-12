POST /api/auth/register

Body

name
email
phoneNumber
password

Response

{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "user": { "id": 1, "name": "John", "email": "john@example.com", "phoneNumber": "", "userType": "customer" },
    "token": "jwt-token"
  }
}

-----------------------

POST /api/auth/login

Body

email
password

Response

{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "user": { "id": 1, "name": "John", "email": "john@example.com", "phoneNumber": "", "userType": "customer" },
    "token": "jwt-token"
  }
}

-----------------------

GET /api/auth/me

Requires authentication via Bearer token or x-auth-token header.

Response

{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { "id": 1, "name": "John", "email": "john@example.com", "userType": "customer" }
}

-----------------------

POST /api/auth/logout

Requires authentication.

-----------------------

GET /api/profile/:userId

-----------------------

POST /api/payment/nowpayments/create

-----------------------

POST /api/payment/nowpayments/webhook

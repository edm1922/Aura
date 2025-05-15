# Aura API Documentation

This document provides information about Aura's internal API endpoints. These endpoints are used by the frontend application to communicate with the backend server.

## Authentication

All API endpoints require authentication unless otherwise specified. Authentication is handled using NextAuth.js with JWT tokens.

### Authentication Headers

```
Authorization: Bearer {token}
```

## API Endpoints

### User Management

#### Register User

Creates a new user account.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "message": "User registered successfully"
    }
    ```
- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:
    ```json
    {
      "error": "Email already in use"
    }
    ```

#### User Profile

Retrieves the current user's profile information.

- **URL**: `/api/user/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "image": "https://example.com/avatar.jpg"
    }
    ```
- **Error Response**:
  - **Code**: 401 Unauthorized
  - **Content**:
    ```json
    {
      "error": "You must be signed in to view your profile"
    }
    ```

#### Update Profile

Updates the current user's profile information.

- **URL**: `/api/user/profile`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "image": "https://example.com/new-avatar.jpg"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "user": {
        "id": "user_id",
        "name": "Updated Name",
        "email": "user@example.com",
        "image": "https://example.com/new-avatar.jpg"
      }
    }
    ```

### Test Management

#### Submit Test

Submits a completed personality test.

- **URL**: `/api/test/submit`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "answers": [
      {
        "questionId": "q1",
        "value": 4,
        "trait": "openness"
      },
      // Additional answers...
    ],
    "traitScores": {
      "openness": 3.5,
      "conscientiousness": 4.2,
      "extraversion": 2.8,
      "agreeableness": 3.9,
      "neuroticism": 2.1
    }
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "testId": "test_result_id"
    }
    ```

#### Get Test Result

Retrieves a specific test result.

- **URL**: `/api/test/{testId}`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**: `testId=[string]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "id": "test_result_id",
      "traits": {
        "openness": 3.5,
        "conscientiousness": 4.2,
        "extraversion": 2.8,
        "agreeableness": 3.9,
        "neuroticism": 2.1
      },
      "insights": [
        "You show a high level of conscientiousness, indicating strong organizational skills and reliability.",
        // Additional insights...
      ],
      "completedAt": "2023-06-15T14:30:00Z"
    }
    ```
- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:
    ```json
    {
      "error": "Test result not found"
    }
    ```

#### Get Test History

Retrieves the user's test history.

- **URL**: `/api/test/history`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `page=[integer]` (optional, default: 1)
  - `pageSize=[integer]` (optional, default: 10)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "results": [
        {
          "id": "test_result_id_1",
          "completedAt": "2023-06-15T14:30:00Z",
          "traits": {
            "openness": 3.5,
            "conscientiousness": 4.2,
            "extraversion": 2.8,
            "agreeableness": 3.9,
            "neuroticism": 2.1
          }
        },
        // Additional test results...
      ],
      "pagination": {
        "total": 25,
        "pages": 3,
        "page": 1,
        "pageSize": 10
      }
    }
    ```

### Insights

#### Generate Insights

Generates AI-powered insights for a test result.

- **URL**: `/api/insights`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "testId": "test_result_id"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "insights": [
        "Your high conscientiousness combined with moderate openness suggests you are organized yet adaptable.",
        // Additional insights...
      ]
    }
    ```
- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:
    ```json
    {
      "error": "Test result not found"
    }
    ```

### Sharing

#### Create Shared Link

Creates a shareable link for a test result.

- **URL**: `/api/share`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "testId": "test_result_id"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "shareId": "abc123xyz"
    }
    ```

#### Get Shared Result

Retrieves a shared test result. This endpoint does not require authentication.

- **URL**: `/api/shared/{shareId}`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**: `shareId=[string]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "traits": {
        "openness": 3.5,
        "conscientiousness": 4.2,
        "extraversion": 2.8,
        "agreeableness": 3.9,
        "neuroticism": 2.1
      },
      "insights": [
        "You show a high level of conscientiousness, indicating strong organizational skills and reliability.",
        // Additional insights...
      ],
      "completedAt": "2023-06-15T14:30:00Z",
      "viewCount": 5
    }
    ```
- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:
    ```json
    {
      "error": "Shared result not found or expired"
    }
    ```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. Current limits:

- 100 requests per minute per user
- 5 insight generation requests per hour per user

When rate limited, the API will respond with:

- **Code**: 429 Too Many Requests
- **Content**:
  ```json
  {
    "error": "Rate limit exceeded. Please try again later."
  }
  ```

## API Versioning

The current API version is v1. All endpoints are prefixed with `/api`.

Future API versions will be accessible via `/api/v2/`, etc.

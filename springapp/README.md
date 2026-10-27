# Course Management System with JWT Authentication

## Features

- CRUD operations for Courses
- Spring Boot REST APIs
- Spring Data JPA
- MySQL Database
- Validation using Jakarta Validation
- Global Exception Handling
- JWT Authentication
- Spring Security
- Swagger UI Integration

---

## Technologies Used

- Java 17
- Spring Boot 3.4
- Spring Security
- JWT
- Spring Data JPA
- MySQL
- Maven
- Swagger OpenAPI

---

## Authentication Flow

### Register

POST

```
/auth/register
```

Example

```json
{
  "username":"shakthi",
  "password":"123456",
  "role":"USER"
}
```

---

### Login

POST

```
/auth/login
```

Example

```json
{
  "username":"shakthi",
  "password":"123456"
}
```

Response

```json
{
  "token":"eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### Swagger Authorization

1. Login using `/auth/login`
2. Copy the JWT token
3. Click **Authorize**
4. Paste the token
5. Execute protected APIs

---

## Protected APIs

```
GET    /api/courses

GET    /api/courses/{id}

POST   /api/courses

PUT    /api/courses/{id}

DELETE /api/courses/{id}
```

---

## Project Structure

```
config/
controller/
dto/
exception/
model/
repository/
service/
```

---


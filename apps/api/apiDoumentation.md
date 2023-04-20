# **Orderly REST API Documentation**

## **Course Routing**

### Course creation

**Request:** POST /course/

```{.json}
{
    "userID" : "123"
    "name": "CS320"
}
```
  
**Response:**

```{.json}
{
    "id": 1,
    "name": "CS320",
    "code": "R1B4C0S",
    "Enrolled": [
        {
            "user_id": "123",
            "course_id": 2,
            "role": 2
        }
    ]
}
```

---

### User enrollment into a course

**Request:** POST /course/enroll

```{.json}
{
    "auth.userId": "123",
    "code": "R1B4C0S"
}
```
  
**Response:**

```{.json}
{
    "user_id": "123",
    "course_id": 2,
    "role": 0
}
```

---

### Get currently enrolled courses

**Request:** GET /course/

```{.json}
{
    "auth.userId": "123",
}
```
  
**Response:**

```{.json}
[
  {
    "user_id": "123",
    "course_id": 2,
    "role": 0
  },
  {
    "user_id": "123",
    "course_id": 3,
    "role": 0
  },
]
```

## **Enrolled Routing**

### Update Role

**Request:** PATCH /enrolled/

```{.json}
    {
        "auth.userId": "123",
        "user_id" : "2"
        "course_id": 5,
        "role": 1
    }
```

**Response:**

```{.json}
{
    "user_id": "2",
    "course_id": 5,
    "role": 1
}
```

---

### Enrolled leaves class

**Request:** DELETE /enrolled/

```{.json}
    {
        "auth.userId": "1",
        "course_id" : 5
    }
```

**Response:**

```{.json}
{
    "user_id": "1",
    "course_id": 5,
}
```

---

### Get Enrolled's current position

**Request:** GET /enrolled/position

```{.json}
    {
        "auth.userId": "1",
        "course_id" : 5
    }
```

**Response:**

```{.json}
{
    "user_id": "1",
    "course_id": 5,
}
```

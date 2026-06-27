# IrishRent 🏠
## Student Accommodation Finder - Dublin, Ireland

**Student Name:** Syed Mubashir Ahmed Hashmi

**Student ID:** 20089221

**Programme:** MSc Information Systems with Computing

**Module:** B9IS130 - Web Development for Information Systems

**Lecturer:** Dr. Obinna Izima | Dublin Business School

**Assignment:** CA1

---

## Live Demo

The application is deployed and running at: **https://irishrent.onrender.com**

> Note: Render free plan sleeps after 15 minutes of inactivity.
> First visit may take 30-60 seconds to wake up - this is normal.

**Demo Login Credentials:**
| Role | Email | Password |
|---|---|---|
| Admin | admin@irishrent.ie | Admin123! |
| Landlord | john@landlord.ie | Landlord123! |
| Tenant | mubashir@tenant.ie | Tenant123! |

---

## Why I Built This

When I arrived in Dublin as an international student, finding reliable accommodation was one of the hardest things I had to deal with. There was no single platform where I could search, compare and review properties in a trustworthy way.

I built IrishRent as a proof-of-concept system inspired by Threshold - the national housing charity in Ireland(threshold.ie, Google Maps verified) - to address this real gap in the student accommodation market.

---

## What the System Does

IrishRent is a full-stack web application where:

- **Tenants** can search properties, filter by area/price/type, read and write reviews, and save properties to a bookmark list
- **Landlords** can create, edit and delete their property listings
- **Admins** have full management access across all data

### Core Features

- Login and register system with role selection (tenant/landlord)
- JWT authentication - token stored in localStorage, persists after refresh
- Role-based access control - landlords, tenants and admins see different things
- Property search and filter (area, type, price range, bedrooms)
- Full CRUD on properties - Create, Read, Update, Delete
- Reviews with star ratings (1-5) - one review per tenant per property
- Bookmark system - save and remove properties from dashboard
- Responsive design - works on desktop and mobile

---

## Project Structure

IrishRent/

├── backend/

│   ├── config/

│   │   └── db.js              - SQLite connection, table creation

│   ├── controllers/

│   │   ├── authController.js  - register, login, getMe, updateProfile

│   │   ├── propertyController.js - full property CRUD with filters

│   │   ├── reviewController.js   - get, add, delete reviews

│   │   └── bookmarkController.js - get, add, remove bookmarks

│   ├── middleware/

│   │   ├── authMiddleware.js  - JWT protect + role authorize

│   │   └── validateMiddleware.js - express-validator error handler

│   ├── routes/

│   │   ├── authRoutes.js

│   │   ├── propertyRoutes.js

│   │   ├── reviewRoutes.js

│   │   └── bookmarkRoutes.js

│   ├── seed.js       - manual seed for local development

│   ├── seed-data.js  - auto-seed for production (Render)

│   └── server.js     - Express app, security middleware, routes

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   │   └── common/

│   │   │       ├── Navbar.js       - responsive nav with auth state

│   │   │       └── PrivateRoute.js - role-based route protection

│   │   ├── context/

│   │   │   └── AuthContext.js  - JWT auth state, login/logout

│   │   ├── pages/

│   │   │   ├── Home.js         - hero, featured properties, how it works

│   │   │   ├── Properties.js   - listing with search and filters

│   │   │   ├── PropertyDetail.js - full info, reviews, bookmarks

│   │   │   ├── Login.js        - JWT login form

│   │   │   ├── Register.js     - role selection + registration

│   │   │   ├── Dashboard.js    - role-based user dashboard

│   │   │   ├── AddProperty.js  - landlord property creation form

│   │   │   ├── EditProperty.js - landlord property update form

│   │   │   └── NotFound.js     - 404 page

│   │   ├── services/

│   │   │   └── api.js  - axios instance, interceptors, all API calls

│   │   └── styles/

│   │       └── main.css  - responsive CSS with CSS variables

│   └── .env

├── render.yaml       - Render deployment configuration

├── package.json      - root build scripts

└── README.md

---

## How to Run Locally

### Prerequisites
- Node.js v18 or higher
- npm

### Step 1 - Clone the repository
```bash
git clone https://github.com/smubashir99/IrishRent.git
cd IrishRent
```

### Step 2 - Install backend dependencies
```bash
cd backend
npm install
```

### Step 3 - Create backend .env file
```bash
# Create backend/.env with:
PORT=5000
JWT_SECRET=irishrent_super_secret_jwt_key_2026
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Step 4 - Seed the database
```bash
node seed.js
```

### Step 5 - Start the backend
```bash
npm run dev
```
Backend runs on: http://localhost:5000

### Step 6 - Install and start the frontend
```bash
cd ../frontend
npm install
npm start
```
Frontend runs on: http://localhost:3000

---

## API Endpoints

| Method | Route | Description | Access |
|---|---|---|---|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login and receive JWT | Public |
| GET | /api/auth/me | Get current user | Private |
| GET | /api/properties | Get all with filters | Public |
| POST | /api/properties | Create property | Landlord |
| PUT | /api/properties/:id | Update property | Landlord |
| DELETE | /api/properties/:id | Delete property | Landlord |
| GET | /api/reviews/:propertyId | Get reviews | Public |
| POST | /api/reviews/:propertyId | Add review | Tenant |
| DELETE | /api/reviews/:id | Delete review | Owner |
| GET | /api/bookmarks | Get bookmarks | Tenant |
| POST | /api/bookmarks/:id | Add bookmark | Tenant |
| DELETE | /api/bookmarks/:id | Remove bookmark | Tenant |

---

## Security Implementation

| Security Measure | Implementation |
|---|---|
| Authentication | JWT tokens - signed with secret, expire after 7 days |
| Password Hashing | bcrypt with salt rounds = 12 |
| SQL Injection | Parameterised queries via better-sqlite3 |
| XSS Prevention | express-validator escape() on all string inputs |
| Security Headers | Helmet middleware - CSP, X-Frame-Options etc |
| Rate Limiting | 100 req/15min general, 10 req/15min for auth routes |
| CORS | Configured to allow only trusted frontend origin |
| Authorisation | Role-based middleware - tenant/landlord/admin |

---

## Database

SQLite with 4 tables and foreign key relationships:

| Table | Key Fields |
|---|---|
| users | id, name, email, password (hashed), role |
| properties | id, title, type, price, area, landlord_id |
| reviews | id, rating, comment, property_id, user_id |
| bookmarks | id, user_id, property_id (unique constraint) |

---

## Technologies Used

| Category | Technology |
|---|---|
| Frontend | React, React Router, Axios, React Toastify |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken), bcrypt |
| Security | Helmet, express-rate-limit, express-validator, CORS |
| Deployment | Render (cloud platform) |
| Version Control | GitHub |

---

## Deployment

The app is deployed on Render using the following configuration:

```yaml
# render.yaml
services:
  - type: web
    name: irishrent
    runtime: node
    buildCommand: npm run render-build
    startCommand: node backend/server.js
```

Build command installs dependencies and builds the React frontend. The Express server then serves both the API and the compiled React build in production mode.

---

## References and Attributions

All references are documented in GitHub commit messages. Where AI tools (Claude by Anthropic, ChatGPT by OpenAI) were used to assist with specific implementation details, this is noted in the relevant commit message using the "Ref:" convention. The overall architecture, system design and majority of the code is my own work.

| Resource | Link | Used For |
|---|---|---|
| Express.js | expressjs.com | Backend framework |
| React | react.dev | Frontend framework |
| better-sqlite3 | github.com/WiseLibs/better-sqlite3 | SQLite driver |
| jsonwebtoken | npmjs.com/package/jsonwebtoken | JWT auth |
| bcryptjs | npmjs.com/package/bcryptjs | Password hashing |
| Helmet | helmetjs.github.io | Security headers |
| express-validator | express-validator.github.io | Input validation |
| express-rate-limit | npmjs.com/package/express-rate-limit | Rate limiting |
| Render | render.com | Cloud deployment |
| Threshold | threshold.ie | Organisation reference |

I have used AI tools (Claude and ChatGPT) to assist with specific parts of the code and to review implementations. All AI usage is referenced in GitHub commit messages. The overall idea, system design, architecture decisions and majority of the code is my own work.
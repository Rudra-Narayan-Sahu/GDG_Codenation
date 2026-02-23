# LeetCode Clone Platform

A full-stack LeetCode-like coding platform with user authentication, problem viewing, code execution, and an admin dashboard for managing problems and test cases.

## Technologies Used
- **Backend**: Node.js, Express.js, MySQL (mysql2), JWT, bcrypt, Axios (for Judge0)
- **Frontend**: React (Vite), Tailwind CSS, React Router, Monaco Editor
- **Execution Engine**: Judge0 API (via RapidAPI)

## Folder Structure
```
leetcode-clone/
├── backend/                  # Node.js + Express backend
│   ├── .env                  # Environment Variables
│   ├── src/
│   │   ├── config/db.js      # MySQL connection
│   │   ├── controllers/      # Auth, Problems, Submissions
│   │   ├── middleware/       # JWT Auth & Role check
│   │   ├── routes/           # Express routes
│   │   ├── services/         # Judge0 Service integration
│   │   └── app.js            # Server entry
│   └── package.json
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Shared UI (Navbar)
│   │   ├── context/          # Auth Context
│   │   ├── pages/            # Home, Login, Register, Admin, Editor
│   │   ├── App.jsx           # Router setup
│   │   └── main.jsx          # React entry
│   ├── index.html            # Vite entry HTML
│   ├── tailwind.config.js    # Tailwind configuration
│   └── package.json
└── database/
    └── schema.sql            # MySQL Database schema definitions
```

## Setup Instructions

### 1. Database Setup
1. Ensure MySQL is installed and running.
2. Login to MySQL: `mysql -u root -p`
3. Run the schema file:
```sql
source database/schema.sql;
```

### 2. Backend Setup
1. Navigate to backend: `cd backend`
2. Install dependencies: `npm install`
3. Edit `.env` file and structure it based on the provided `.env.example`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=leetcode_clone
JWT_SECRET=your_jwt_secret_key
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
```
4. Get your Judge0 key from [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce).
5. Start server: `npm run dev` (Runs on http://localhost:5000)

### 3. Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access the app on your browser typically at `http://localhost:5173`

### 4. Admin Setup
1. Go to `http://localhost:5173/register` and create an account.
2. The default role is 'User'. To make an Admin, open your MySQL terminal and run:
```sql
UPDATE users SET role = 'Admin' WHERE email = 'your_email@example.com';
```
3. Logout and login again. You will now see the `Admin` nav link!

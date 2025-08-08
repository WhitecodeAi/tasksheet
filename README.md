# TaskSheet

**TaskSheet** is a modern, task-focused timesheet management application designed for teams to track project effort in a simple, intuitive interface. 
It avoids the traditional "timesheet" label to encourage better adoption and a more engaging experience.

## 🚀 Features

- Secure user login with JWT authentication
- Project-wise time tracking
- Track effort spent over last 5 days
- Admin and user dashboards (coming soon)
- Built with:
  - React (Material UI)
  - Node.js + Express
  - MySQL

## 📁 Folder Structure

```
TaskSheet/
├── server/                # Backend API using Node.js and Express
│   ├── routes/           # Login and project-related routes
│   ├── db.js             # MySQL DB connection
│   ├── server.js         # Entry point for backend
│   └── .env.example      # Environment variable template
│
├── client/            # Frontend React app (client)
│   ├── src/Components
│   ├── src/Pages
│   ├── public/
│   └── ...
│
└── .gitignore
```


## 🛠️ Setup Instructions

### 1. Clone the repository

git clone https://github.com/shrutijog-1507/tasksheet.git
cd client

### 2. Server setup
cd server
cp .env.example .env  # and fill in your values

npm install
npm start

### 3. Frontend setup
cd ../client
npm install
npm start
The React app will start on http://localhost:3000
The Express server will run on http://localhost:5000 (or as per your .env)

 
## 📌 To Do  
✔️ Role-based routing (Admin/User)  
📊 Timesheet analytics  
📋 Project summaries for management  
📧 Email notifications / Reminders  

## 🙋‍♀️ Maintainer  
👩 Shruti Jog  
🧠 UI/UX designer turned full-stack project manager  
📧 shruti.jog@gmail.com  

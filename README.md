🚀 Sakha_chat
A real-time chat application built using the MERN stack (MongoDB, Express.js, React, Node.js). Designed for speed, scalability, and seamless user experience.

📦 Tech Stack
Frontend: React with Context API, custom hooks, and modular components

Backend: Express.js with RESTful APIs, JWT-based authentication, and MongoDB integration

Database: MongoDB with Mongoose schema modeling

Real-time: Socket.io (optional for chat updates)

Environment: .env for secrets, .gitignore for clean commits

📁 Folder Structure
Code
Sakha_chat/
├── frontend/       # React app with context, routing, and UI
│   ├── src/
│   ├── public/
│   └── .env
├── backened/       # Express server with routes, models, and controllers
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── .gitignore
├── package.json
└── README.md
🛠 Setup Instructions
bash
# Clone the repo
git clone https://github.com/saks-hamjain/Sakha_chat.git
cd Sakha_chat

# Install backend dependencies
cd backened
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start the backend
npm run server

# Start the frontend
npm start
Make sure to create your own .env file in both frontend/ and backened/ with the required keys.

🌐 Live Features (Planned or Implemented)
✅ User authentication

✅ Modular frontend architecture

✅ RESTful API integration

⏳ Real-time messaging (Socket.io)

⏳ Deployment-ready structure

📄 License
This project is open-source under the MIT License.

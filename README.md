# 🚀 Interview Prep

> A collaborative, AI-powered platform for frontend interview preparation built with modern web technologies.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://interview-prep-iota-silk.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-89.6%25-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933)](https://nodejs.org/)

## ✨ Overview

Interview Prep is a full-stack application designed to help developers prepare for frontend engineering interviews through collaborative learning and AI-assisted practice. The platform combines real-world interview questions with intelligent feedback powered by Groq AI.

### Key Features

- **🤖 AI-Powered Feedback**: Leverage Groq AI for intelligent code reviews and suggestions
- **👥 Collaborative Learning**: Work together with peers in real-time
- **📝 Comprehensive Question Bank**: Curated frontend interview questions covering JavaScript, TypeScript, React, and more
- **💾 Progress Tracking**: Save your solutions and track your improvement over time
- **🎯 Structured Practice**: Organized by difficulty and topic areas
- **🔐 Secure Authentication**: Full user authentication and authorization system

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **CSS3** - Modern styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web application framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** (Supabase) - Database
- **Groq AI** - AI integration

## 🚦 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (or Supabase account)
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mariokonnari/Interview-Prep.git
   cd Interview-Prep
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   GROQ_API_KEY="your_groq_api_key"
   JWT_SECRET="your_jwt_secret"
   PORT=3000
   ```

   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

5. **Run the application**

   In separate terminals:
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend
   cd client
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
Interview-Prep/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── prisma/        # Database schema and migrations
│   └── package.json
│
└── README.md
```

## 🎯 Core Features Breakdown

### 1. Question Management
- Browse questions by category (JavaScript, TypeScript, React, System Design)
- Filter by difficulty level (Easy, Medium, Hard)
- Search functionality for quick access

### 2. AI-Powered Code Review
- Submit your solutions for AI analysis
- Receive detailed feedback on:
  - Code quality and best practices
  - Time and space complexity
  - Potential optimizations
  - Common pitfalls and edge cases

### 3. User Authentication
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints

### 4. Progress Tracking
- Save and revisit your solutions
- Track completed questions
- Monitor improvement over time

## 🔒 Security

- Password hashing with bcrypt
- JWT tokens for session management
- Environment variables for sensitive data
- CORS configuration for API security
- Input validation and sanitization

## 🚀 Deployment

### Backend (Vercel)
```bash
# Set environment variables in your hosting platform
DATABASE_URL=your_production_db_url
GROQ_API_KEY=your_api_key
JWT_SECRET=your_production_secret
```

### Frontend (Netlify)
```bash
# Build command
npm run build

# Output directory
dist

# Environment variables
VITE_API_URL=your_backend_url
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

**Marios Konnari**

- GitHub: [@mariokonnari](https://github.com/mariokonnari)
- Portfolio: [\[Your Portfolio URL\]](https://marios-portfolio-website.vercel.app/)

## 🙏 Acknowledgments

- Groq AI for intelligent code analysis
- Supabase for database infrastructure
- The frontend development community for inspiration

---

<p align="center">Made with ❤️ for developers preparing for their dream job</p>
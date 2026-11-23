# 🍔 Urban Bite Kitchen

A full-stack food ordering web application built using React, Node.js, Express, and Supabase.

## 📖 Project Description

Urban Bite Kitchen is an online food ordering system that allows customers to browse food and drinks, add products to their shopping cart, place orders, and track their order history.

The system also includes an administrator dashboard for managing products and customer orders.

## 🚀 Features

### Customer
- Customer registration and login
- Browse food and drinks
- View products by category
- Add products to cart
- Update quantities and remove items
- Place orders using Cash on Delivery (COD)
- View order history
- Download order receipts

### Administrator
- Administrator login
- Manage food products
- Manage categories
- View customer orders
- Update order statuses
- Access the admin dashboard

## 🛠️ Technologies Used

**Frontend**
- React.js
- Vite
- JavaScript
- CSS
- React Router

**Backend**
- Node.js
- Express.js
- REST API
- JWT authentication

**Database**
- Supabase (PostgreSQL)

**Deployment**
- Vercel — Frontend
- Render — Backend

## 📁 Project Structure

```text
Urban_Bite_Kitchen/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   └── package.json
└── README.md
```

## 💻 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dymlopecillo202400228/Urban_Bite_Kitchen.git
cd Urban_Bite_Kitchen
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_backend_jwt_secret
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Start the backend:

```bash
npm start
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

## 🌐 Live Website

**Frontend (Vercel)**

https://urban-bite-kitchen-one.vercel.app

**Backend (Render)**

https://urban-bite-api.onrender.com

## 📱 Mobile Support

Urban Bite Kitchen features a responsive design for desktop and mobile browsers.

The website can also be added to a phone's home screen. Full Progressive Web App (PWA) support is planned for future development.

## 🔐 Security

- Password hashing
- JWT-based authentication
- Protected API routes
- Role-based access control
- Environment variables for sensitive credentials
- Server-side database operations

## 🔮 Future Improvements

- Online payment gateway integration
- Push notifications
- Order tracking updates
- Progressive Web App (PWA) installation
- Customer product reviews
- Improved sales reporting

## 📄 Project Purpose

Developed as a full-stack web application project demonstrating frontend development, REST API integration, database management, authentication, and cloud deployment.

## 📌 Project Status

Deployed for testing and further development. Backend connectivity and application functionality should be verified before production use.

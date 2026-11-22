# RVPN

**RVPN** is a VPN service web application built with React, TypeScript, Node.js, Express, and PostgreSQL.

The project includes a frontend application, a REST API backend, user authentication, account management, balance operations, and subscription management.

## Features

### Frontend
- React 19 and TypeScript
- Vite development environment
- React Router navigation
- User registration and login
- Protected account page
- User profile management
- Subscription plan selection
- Payment confirmation modal
- Balance display and demo top-ups
- API integration with the backend

### Backend
- Node.js and Express 5
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Password hashing with bcrypt
- Request validation with Zod
- User profile management
- Balance management and transaction history
- Subscription reservations and confirmation
- Reservation cancellation and expiration
- Idempotency protection for balance operations
- Transactional balance updates

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Build tool | Vite |
| Routing | React Router |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| Development | ESLint, tsx |

## Project Structure

```text
RVPN/
├── public/
├── src/
│   ├── api/             # API requests
│   ├── components/      # UI components
│   ├── context/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── mocks/           # Mock Service Worker
│   ├── pages/           # Application pages
│   ├── App.tsx
│   └── main.tsx
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── balance/
│       │   └── subscriptions/
│       └── app.ts
│
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js 24.x
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/lantin-creator/VPN.git
cd VPN
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure the frontend

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Install backend dependencies

```bash
cd server
npm install
```

### 5. Configure the backend

Create `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/rvpn"
JWT_SECRET="your_long_random_secret"
PORT=3000
CLIENT_URL="http://localhost:5173"
```

Replace the database credentials and JWT secret with your own values.

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Apply database migrations

```bash
npx prisma migrate dev
```

### 8. Start the backend

```bash
npm run dev
```

The backend will be available at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

### 9. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

## API Overview

All API endpoints use the `/api` prefix.

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/auth/register` | Register a user | No |
| POST | `/auth/login` | Log in | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/users/me` | Get user profile | Yes |
| PATCH | `/users/me` | Update user profile | Yes |
| GET | `/balance` | Get account balance | Yes |
| GET | `/balance/transactions` | Get transaction history | Yes |
| POST | `/balance/top-up` | Demo balance top-up | Yes |
| POST | `/subscriptions/reservations` | Create subscription reservation | Yes |
| POST | `/subscriptions/reservations/:reservationId/confirm` | Confirm reservation | Yes |
| GET | `/subscriptions/reservations` | Get reservations | Yes |
| POST | `/subscriptions/reservations/:reservationId/cancel` | Cancel reservation | Yes |

Protected endpoints require a JWT token in the `Authorization` header:

```text
Authorization: Bearer YOUR_TOKEN
```

## Subscription Plans

| Plan | Duration | Price |
|---|---:|---:|
| Monthly | 30 days | 299 RUB |
| Quarterly | 90 days | 499 RUB |
| Yearly | 365 days | 1,699 RUB |

All monetary values are stored on the backend in kopecks to avoid floating-point precision issues.

The subscription flow uses balance reservations:
1. A reservation is created.
2. The required amount is frozen.
3. The reservation is confirmed or cancelled.
4. On confirmation, the amount is deducted and a subscription is created.
5. Pending reservations expire after 15 minutes.

## Available Scripts

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Deploy frontend to GitHub Pages |

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start backend in watch mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Start compiled backend |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |

## Security Notes

- Never commit `.env` files or database credentials.
- Use a strong, unique JWT secret.
- Passwords are hashed with bcrypt.
- Protected API routes require authentication.
- Balance operations are handled on the backend.
- Demo top-ups do not process real payments.

## License

This project is currently under development. No license has been specified yet.
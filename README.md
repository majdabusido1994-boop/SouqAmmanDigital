# SOUQ AMMAN DIGITAL (SAD)

A mobile-first digital marketplace for Amman, Jordan. Local sellers (especially Instagram-based shops) can create their own shop and list products. Buyers can browse, discover, and connect with local creators.

## Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Auth:** JWT
- **Storage:** Cloudinary
- **Real-time:** Socket.io

## Project Structure

```
souq-amman-digital/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── server.js         # Entry point
│   └── .env.example      # Environment variables template
├── mobile/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context provider
│   │   ├── navigation/   # React Navigation setup
│   │   ├── screens/      # App screens
│   │   ├── services/     # API service layer
│   │   └── theme/        # Colors, typography, spacing
│   ├── App.js            # Entry point
│   └── app.json          # Expo config
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials
npm install
npm run dev
```

The server runs on `http://localhost:5000`.

### Mobile App Setup

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator.

> **Note:** Update `API_URL` in `mobile/src/services/api.js` to your machine's IP address when testing on a physical device (e.g., `http://192.168.1.X:5000/api`).

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (supports filters: category, search, minPrice, maxPrice, neighborhood, sort) |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product (auth) |
| PUT | `/api/products/:id` | Update product (owner) |
| DELETE | `/api/products/:id` | Delete product (owner) |
| POST | `/api/products/:id/like` | Like/unlike product (auth) |
| POST | `/api/products/:id/upload` | Upload images (owner) |

### Shops
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shops` | List shops (supports filters: category, search, neighborhood) |
| GET | `/api/shops/:id` | Get shop details + products |
| POST | `/api/shops` | Create shop (auth) |
| PUT | `/api/shops/:id` | Update shop (owner) |
| POST | `/api/shops/:id/follow` | Follow/unfollow shop (auth) |
| POST | `/api/shops/:id/upload` | Upload shop image (owner) |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get conversations (auth) |
| GET | `/api/messages/:userId` | Get messages with user (auth) |
| POST | `/api/messages/:userId` | Send message (auth) |

## Design System

Warm Amman-inspired palette:
- **Terracotta** `#C4763B` - Primary actions, branding
- **Beige** `#F5E6D3` - Backgrounds
- **Olive** `#6B7B3A` - Secondary actions, success states
- **Sand** `#E8D5B7` - Cards, surfaces

Rounded UI with soft shadows for a cozy, handmade feel.

## Features

- Scrollable product feed with category filters
- Full product detail with image carousel
- Shop profiles with follower system
- In-app messaging with offer & custom order support
- WhatsApp & Instagram integration
- Neighborhood-based discovery (Amman)
- Search with price and category filters
- Like/save products, follow shops

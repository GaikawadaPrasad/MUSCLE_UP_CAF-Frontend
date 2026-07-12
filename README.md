# MuscleUP Café Billing & Sales Management System

A production-ready MERN stack web application for internal staff at **MuscleUP Café** to manage daily sales of food items and gym supplements. Built with a mobile-first responsive layout (for Android and iPads), it is optimized for high checkout speeds (under 10 seconds) and comprehensive daily reporting with PDF downloads.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, React Icons, React Select, React Hook Form, Date-Fns, jsPDF + AutoTable, Chart.js + React-Chartjs-2, React Hot Toast.
- **Backend**: Node.js, Express.js (MVC design patterns).
- **Database**: MongoDB (via Mongoose schemas).

---

## 📁 Project Structure

```
MuscleUP Cafe/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Layout, Sidebar/Bottombar wrappers
│   │   ├── context/        # AppContext (global states & Axios fetch hooks)
│   │   ├── pages/          # Dashboard, Billing, Products, Reports
│   │   ├── services/       # API axios client config
│   │   ├── index.css       # Tailwind rules & custom UI utilities
│   │   └── App.jsx         # Main router and alerts config
│   └── tailwind.config.js  # Theme, fonts, and green/gold brand colors
├── server/                 # Express Backend
│   ├── config/             # DB connection configuration
│   ├── controllers/        # Controllers (Products, Sales, Dashboard, Reports)
│   ├── models/             # Mongoose Schemas (Product, Sale)
│   ├── routes/             # REST Endpoints mapping
│   ├── utils/              # Seeding script (Pre-seeded with Cafe menu + supplement variants)
│   └── server.js           # Server entrance mapping
├── .gitignore              # Git ignore configuration
└── README.md               # Setup and instruction manual
```

---

## ⚙️ Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`

### Step 1: Install Dependencies
Run the install command in both `server/` and `client/` directories:

1. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

### Step 2: Configure Environment
In the `server` directory, configure the `.env` file (copied from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/muscleup_cafe
NODE_ENV=development
```

### Step 3: Seed Sample Data
Run the seeding script to instantly populate the database with MuscleUP Café menu items (Classic Oats Bowl, Overnight Oats, Shakes, Toasts, etc.), sample supplements (Whey Protein, Creatine, Pre-Workout with flavor/size variants), and a 7-day sales activity history:
```bash
cd server
npm run seed
```

---

## 🚀 Running the Application

### Option A: Development Environment (Concurrent Servers)

1. **Start Backend Server** (runs on port `5000` with hot reloading):
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend Dev Server** (runs on port `5173` with Vite HMR):
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

---

### Option B: Production Environment (Single Server Package)

You can package both the frontend and backend to run on a single unified server instance (port `5000`):

1. **Build the Frontend Bundle**:
   ```bash
   cd client
   npm run build
   ```
   This compiles production assets into `client/dist`.

2. **Launch Production Server**:
   Change environment to production and start the backend:
   ```bash
   cd ../server
   # Set environment to production
   # On Windows (PowerShell):
   $env:NODE_ENV="production"
   # On Windows (CMD):
   set NODE_ENV=production
   # On macOS/Linux:
   export NODE_ENV=production

   npm start
   ```

3. Open your browser and navigate to `http://localhost:5000`. The Express server will serve both the backend API and frontend pages.

---

## 🌟 Key Application Features

1. **Dashboard Analytics**:
   - Modern, glowing cards representing Today's Revenue, Total Orders, Supplements Sold, Food Sales, Average Order Value (AOV), and Best Seller.
   - Interactive line chart mapping weekly revenue trends.
   - Visual breakdown of payment modes (UPI, Cash, Card, Other) using doughnut chart representation.
   - Top 5 selling items overall and real-time recent sales activity panel.

2. **10-Second Billing & Checkout**:
   - Tab-based filtering for Food, Supplements, Popular (Frequent), and Recent items.
   - Large touch-friendly grid items for mobile phones and iPads.
   - Dynamic billing drawer showing item parameters.
   - **For Supplements**: Populates dropdown selectors dynamically with available sizes and flavors (e.g. 500g, 1kg | Chocolate, Vanilla). Changing size automatically updates unit prices.
   - **Custom Pricing**: Unit prices can be customized directly prior to recording a sale (e.g., discounting a bowl from ₹89 to ₹79).
   - Walk-in / Customer Details (Name & Phone optional).
   - Today's Transactions table listed underneath the billing form with options to edit or delete today's records.

3. **Product Management Panel**:
   - View, search, toggle status (Active/Inactive), or delete items.
   - Create new items. Selecting the **Supplement** category reveals sub-variant controls (dynamically add pack sizes with separate prices, and list available flavors).

4. **Reporting and PDF Generator**:
   - Query sales figures based on predefined ranges: Today, Yesterday, Single Target Day, or Custom Date Ranges.
   - Outputs complete transaction summaries, ticket splits, and billing breakdowns.
   - High-fidelity PDF report generation featuring clean tables, billing metadata, store details, and overall sales metrics with page counts using `jsPDF`.

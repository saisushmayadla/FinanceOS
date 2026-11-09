# FinanceOS – Personal Finance Management System

> A luxury, minimal, and responsive full-stack MERN (MongoDB, Express, React, Node.js) web application engineered for disciplined personal financial planning, real-time transaction tracking, and proactive budget enforcement.

---

## 1. Project Introduction

**FinanceOS** is an individual personal finance management platform designed with the look, feel, and polish of a high-end fintech SaaS system (inspired by Linear and Mercury). Built using a clean champagne-gold and obsidian aesthetic, FinanceOS eliminates financial ambiguity by transforming raw transactions into actionable intelligence.

Unlike shallow mock UI prototypes, FinanceOS is a **full-stack operational system**: every metric, cash flow chart, budget usage bar, and category breakdown is calculated dynamically via MongoDB aggregation pipelines connected to a resilient Express RESTful API.

---

## 2. Problem Statement

Most individuals manage personal finances through fragmented spreadsheets, disjointed banking apps, or over-complicated software laden with visual clutter and distracting ads. This causes:
- Lack of consolidated awareness over total inflows versus operational outflow.
- Untracked lifestyle inflation and surprise monthly deficits.
- Difficulty adhering to category budgets without proactive, immediate warning indicators.
- Inflexible transaction audit trails with limited filtering and sorting capabilities.

**FinanceOS solves this** by offering a centralized, distraction-free command center that consolidates cash flow visualization, budget threshold enforcement, and categorized transaction ledgers into one unified, responsive platform.

---

## 3. Key Features

### ⚡ Executive Dashboard
- **Real-Time KPI Cards**: Total Income, Total Expenses, Current Net Balance, and Active Monthly Budget Remaining.
- **Monthly Cash Flow Trends**: 6-month historical income versus expense bar comparison powered by Recharts.
- **Expense Category Breakdown**: Interactive donut chart visualizing spending distribution across categories.
- **Budget Overview Widget**: Category progress bars with real-time percentage consumption and proactive overage badges.
- **Recent Transactions Ledger**: Instant view of the 6 most recent transactions with type indicators and quick links.
- **One-Click Demo Data**: Instant seeding feature to populate multi-month realistic financial data for presentations and evaluations.

### 💳 Transaction Management
- **Full CRUD Operations**: Create, Read, Update, and Delete both income and expense transactions.
- **Multi-Factor Search & Filtering**:
  - Live full-text search matching titles, categories, and descriptions.
  - Filter by transaction type (`All`, `Income`, `Expense`).
  - Filter by category (`Salary`, `Housing`, `Food & Dining`, `Utilities`, `Shopping`, `Entertainment`, `Health`, etc.).
  - Date window filtering (Start Date to End Date).
- **Multi-Field Sorting**: Sort transactions by Date (Newest/Oldest), Amount (Highest/Lowest), or Title (A–Z).
- **Confirmation Safety**: Modals to prevent accidental deletions.

### 🎯 Budget Management & Alert Controls
- **Category-Specific Monthly Targets**: Define exact spending allowances for any category and calendar month/year.
- **Automated Spending Computation**: Automatically queries MongoDB expense records for the matching month/year to compute real-time utilization.
- **Overage Warning Banners**: Prominent alert banners trigger whenever a category exceeds 100% or approaches 80% threshold.
- **Remaining Balance Calculations**: Displays remaining capital or exact overage amounts.
- **Historical & Future Planning**: Navigate forward or backward across months to plan ahead or audit previous periods.

### 📊 Financial Health & Summary Statement
- **Cash Flow Analytics**: Monthly Income, Monthly Expenses, Net Savings, and Savings Rate percentage.
- **6-Month Area Chart**: Monotone gradient charts illustrating income vs expense trajectories.
- **Category-Wise Spending Table**: Tabular view of total spend, count of transactions, and distribution share per category.
- **CSV Data Export**: One-click download of the complete transaction ledger as a standardized `.csv` file.

### 📱 Responsive & Professional UI/UX
- **Design Tokens**: Deep Obsidian (`#171717`), Warm Off-White (`#F8F7F4`), Champagne Gold (`#C6A96B`), Crisp White Cards (`#FFFFFF`).
- **Typography**: Inter / Plus Jakarta Sans for clean readability, JetBrains Mono for monetary figures.
- **Adaptive Layout**: Desktop sidebar navigation folds seamlessly into a sliding drawer menu for mobile and tablet devices.
- **Toasts & Feedback**: Non-blocking toast notifications for all network mutations and errors.

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM (v6)
- **Data Fetching & HTTP**: Axios
- **Data Visualization**: Recharts (ResponsiveContainer, BarChart, PieChart, AreaChart)
- **Iconography**: Lucide React
- **Styling**: Modern CSS3 Custom Properties (Design System Tokens)

### Backend
- **Runtime**: Node.js (v18+ / v20+ / v24+)
- **Web Framework**: Express.js (v4.21+)
- **Database ODM**: Mongoose (v8.6+)
- **Database Engine**: MongoDB Atlas (Cloud) / Local MongoDB / In-memory MongoDB fallback
- **Environment**: dotenv & cors
- **Testing**: Built-in HTTP integration test runner (`server/test-api.js`)

---

## 5. Application Architecture

```
                  ┌────────────────────────────────────────┐
                  │          Client (React + Vite)         │
                  │   Dashboard | Transactions | Budgets   │
                  └───────────────────┬────────────────────┘
                                      │ HTTP / JSON (Axios)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          Express.js REST API           │
                  │  Controllers | Middleware | ErrorHandler│
                  └───────────────────┬────────────────────┘
                                      │ Mongoose Models & Aggregations
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         MongoDB Database               │
                  │  Transactions Collection | Budgets Coll│
                  └────────────────────────────────────────┘
```

---

## 6. Project Folder Structure

```
FinanceOS/
├── api/
│   └── index.js                      # Serverless handler for Vercel
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/                   # Brand assets and graphics
│   │   ├── components/
│   │   │   ├── BudgetModal.jsx       # Modal for creating/updating monthly budgets
│   │   │   ├── ConfirmModal.jsx      # Reusable dialog for deletion safety
│   │   │   ├── Header.jsx            # Dynamic top bar with quick actions
│   │   │   ├── Sidebar.jsx           # Responsive desktop & mobile drawer
│   │   │   ├── StatCard.jsx          # KPI card component
│   │   │   ├── Toast.jsx             # Non-intrusive alert toasts
│   │   │   └── TransactionModal.jsx  # Modal for adding/editing transactions
│   │   ├── hooks/
│   │   │   └── useToast.jsx          # Context provider and hook for notifications
│   │   ├── pages/
│   │   │   ├── BudgetsPage.jsx       # Budget monitoring and threshold alerts
│   │   │   ├── DashboardPage.jsx     # Overview KPIs, charts, and budget usage
│   │   │   ├── FinancialSummaryPage.jsx # In-depth reports, cash flow, CSV export
│   │   │   └── TransactionsPage.jsx  # Searchable, filterable ledger table
│   │   ├── services/
│   │   │   └── api.js                # Centralized Axios API service
│   │   ├── App.jsx                   # Router & shell orchestration
│   │   ├── index.css                 # Global design system & theme tokens
│   │   └── main.jsx                  # React DOM entry point
│   ├── .env.example                  # Client environment template
│   ├── index.html                    # Root HTML template
│   ├── package.json                  # Client dependencies
│   ├── vercel.json                   # Vercel SPA rewrite configuration
│   └── vite.config.js                # Vite build & reverse-proxy configuration
├── server/
│   ├── config/
│   │   └── db.js                     # MongoDB connection with memory fallback
│   ├── controllers/
│   │   ├── budgetController.js       # Budget CRUD & dynamic usage calculation
│   │   ├── dashboardController.js    # Aggregated metrics & demo data seeder
│   │   └── transactionController.js # Transaction CRUD, filters, & sorting
│   ├── middleware/
│   │   └── errorHandler.js           # Centralized Mongoose/Express error handler
│   ├── models/
│   │   ├── Budget.js                 # Budget schema with compound uniqueness
│   │   └── Transaction.js            # Transaction schema with indexes
│   ├── routes/
│   │   ├── budgetRoutes.js           # /api/budgets endpoints
│   │   ├── dashboardRoutes.js        # /api/dashboard endpoints
│   │   └── transactionRoutes.js      # /api/transactions endpoints
│   ├── .env.example                  # Server environment template
│   ├── package.json                  # Server dependencies
│   ├── server.js                     # Express app bootstrap
│   └── test-api.js                   # Automated end-to-end API test runner
├── .gitignore
├── package.json                      # Root workspace scripts
├── vercel.json                       # Monorepo Vercel deployment configuration
└── README.md                         # Complete documentation
```

---

## 7. Environment Variable Configuration

### Server Environment (`server/.env`)
Create a `.env` file inside the `server/` folder based on `server/.env.example`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/financeos?retryWrites=true&w=majority

# Client URL (for CORS allowance):
CLIENT_URL=http://localhost:5173
```

> **Note on Zero-Configuration Fallback**: If `MONGO_URI` is left unset during local development or evaluation, the server automatically boots an in-memory MongoDB instance via `mongodb-memory-server`. This ensures zero configuration friction when running the app for evaluation.

### Client Environment (`client/.env`)
Create a `.env` file inside the `client/` folder based on `client/.env.example`:

```env
# Vite reverse-proxies /api to http://localhost:5000 in development
VITE_API_BASE_URL=/api
```

---

## 8. RESTful API Documentation

### Dashboard Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Returns aggregated metrics, totals, monthly trends, and budget usage |
| `POST` | `/api/dashboard/seed` | Seeds realistic sample transactions and budgets (`{ force: true }`) |
| `GET` | `/api/health` | Service health status check |

### Transaction Endpoints
| Method | Endpoint | Query Parameters / Body | Description |
|---|---|---|---|
| `GET` | `/api/transactions` | `type`, `category`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder` | List transactions with filters and sorting |
| `GET` | `/api/transactions/:id` | None | Get transaction by ID |
| `POST` | `/api/transactions` | `{ title, amount, type, category, date, description }` | Create transaction |
| `PUT` | `/api/transactions/:id` | Partial or full transaction fields | Update transaction |
| `DELETE` | `/api/transactions/:id` | None | Delete transaction |

### Budget Endpoints
| Method | Endpoint | Query Parameters / Body | Description |
|---|---|---|---|
| `GET` | `/api/budgets` | `month`, `year` | List monthly budgets with calculated actual spending and usage |
| `GET` | `/api/budgets/:id` | None | Get budget target by ID |
| `POST` | `/api/budgets` | `{ category, amount, month, year }` | Create budget target (unique per category/month/year) |
| `PUT` | `/api/budgets/:id` | `{ amount }` | Update budget cap |
| `DELETE` | `/api/budgets/:id` | None | Delete budget target |

---

## 9. MongoDB Setup & Configuration

### Option A: MongoDB Atlas (Recommended for Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free shared cluster.
2. Under **Database Access**, create a user with read/write permissions.
3. Under **Network Access**, add IP address `0.0.0.0/0` (allow from anywhere) or your current IP.
4. Click **Connect** -> **Connect your application** -> Copy the connection string.
5. Paste into `server/.env` as `MONGO_URI`.

### Option B: Local MongoDB
Ensure `mongod` is running locally on port 27017:
```env
MONGO_URI=mongodb://localhost:27017/financeos
```

### Option C: Instant In-Memory Mode
Leave `MONGO_URI` commented out in `server/.env`. The backend will spin up an isolated, in-memory MongoDB database automatically.

---

## 10. Local Execution Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Step 1: Install Dependencies
From the root folder:
```bash
# Install root, server, and client packages
npm run install:all
```
*(Or navigate to `server/` and run `npm install`, then to `client/` and run `npm install`)*

### Step 2: Run Automated API Tests
Verify backend endpoints and database connectivity:
```bash
cd server
node test-api.js
```
Expected output:
```
✔ ALL 11 API TESTS PASSED SUCCESSFULLY!
```

### Step 3: Start the Application
Run both the Express API and Vite React client simultaneously:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Open your browser to `http://localhost:5173`. Click the **Demo Data** button in the top navigation bar to populate realistic financial transactions and budgets with a single click.

---

## 11. GitHub Upload Instructions

To publish this project to GitHub:

```bash
# 1. Initialize git repository in the FinanceOS folder
cd FinanceOS
git init

# 2. Stage all files (respects .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: initial commit for FinanceOS full-stack personal finance system"

# 4. Create repository on GitHub and link remote
git branch -M main
git remote add origin https://github.com/<your-username>/FinanceOS.git

# 5. Push to GitHub
git push -u origin main
```

---

## 12. Deployment Instructions

### Frontend Deployment on Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `FinanceOS` repository.
4. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Environment Variables:
   - Add `VITE_API_BASE_URL` pointing to your deployed backend API URL (e.g. `https://financeos-api.onrender.com/api`).
6. Click **Deploy**. The `client/vercel.json` file ensures client-side routes (`/transactions`, `/budgets`, `/summary`) are resolved correctly without 404 errors.

### Backend Deployment (Render / Railway / VPS)
1. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGO_URI=<Your MongoDB Atlas Connection String>`
   - `CLIENT_URL=<Your Vercel Frontend URL>`
5. Click **Deploy**. Copy the generated URL into your client's `VITE_API_BASE_URL`.

---

## 13. UI Architecture & Design Details

- **Minimalist Luxury Palette**:
  - Background: `#F8F7F4` (Warm Alabaster)
  - Cards: `#FFFFFF` with hairline borders (`#E8E5DF`)
  - Accent: `#C6A96B` (Champagne Gold)
  - Primary Dark: `#171717` (Deep Obsidian)
- **Fluid Layout**:
  - CSS Grid with `repeat(auto-fit, minmax(...))` enables native responsive reflow.
  - Zero heavy external component libraries—ensures instant page load and zero layout shift.
- **Empty State UX**:
  - Contextual prompts invite the user to record transactions or load demo data when collections are empty.

---

## 14. License

This project is licensed under the MIT License. Developed for university coursework and production evaluation.

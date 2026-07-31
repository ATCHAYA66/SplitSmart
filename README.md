# SplitSmart - Full-Stack Expense Sharing Application 

A modern, full-stack expense sharing web application built with **React (Vite)**, **Tailwind CSS**, **Spring Boot 3**, **Spring Security (JWT)**, and **H2 Database**.

---

##  Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom glassmorphic aesthetics
- **Icons**: Lucide React Icons
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with Bearer token request interceptor & 401 response handling
- **State**: React Context API (`AuthContext`, `ExpenseContext`)

### Backend
- **Framework**: Java 21, Spring Boot 3.3.2
- **Build Tool**: Apache Maven
- **Security**: Spring Security (Stateless JWT Bearer Authentication, BCrypt Password Encoder)
- **Database**: H2 (file-based persistence at `./data/expensedb`)
- **ORM**: Spring Data JPA / Hibernate
- **Precision**: `BigDecimal` for all monetary calculations

---

##  Quick Start Guide

### Prerequisites
- **Java 21** or later
- **Apache Maven 3.9+**
- **Node.js v18+** & **npm**

---

### Step 1: Start Backend (Spring Boot)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd splitwise-app/backend
   ```
2. Run Spring Boot application via Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The backend server will start at: **`http://localhost:8080`**
4. H2 Database Console (Optional): `http://localhost:8080/h2-console`
   - **JDBC URL**: `jdbc:h2:file:./data/expensedb`
   - **Username**: `sa`
   - **Password**: *(leave blank)*

---

### Step 2: Start Frontend (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd splitwise-app/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at: **`http://localhost:5173`**

---

##  Pre-seeded Demo Credentials

For quick testing without creating a new user, the database automatically seeds demo accounts on first launch:

| User | Email | Password |
|---|---|---|
| **Alice Smith** | `alice@example.com` | `password123` |
| **Bob Johnson** | `bob@example.com` | `password123` |
| **Charlie Brown** | `charlie@example.com` | `password123` |

*Note: The login page includes one-click demo login buttons for Alice, Bob, and Charlie.*

---

## 📡 Complete REST API Endpoint Reference

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/register` - Register a new user (`{ name, email, password }`)
- `POST /api/auth/login` - Authenticate and receive JWT (`{ email, password }`)
- `GET /api/auth/me` - Get profile of currently authenticated user

### Group Endpoints (`/api/groups`)
- `POST /api/groups` - Create a new group (`{ name, description, category }`)
- `POST /api/groups/join` - Join an existing group (`{ joinCode }`)
- `GET /api/groups` - List all groups the user belongs to
- `GET /api/groups/{id}` - Get group details
- `GET /api/groups/{id}/members` - List all members of a group

### Expense Endpoints (`/api/expenses`)
- `POST /api/expenses` - Create a new group expense (Supports `EQUAL`, `EXACT`, and `PERCENTAGE` split strategies)
- `GET /api/expenses/group/{groupId}` - List all expenses in a group
- `GET /api/expenses/user` - List user's expenses across all groups
- `GET /api/expenses/{id}` - Get detailed expense info with participant splits
- `DELETE /api/expenses/{id}` - Delete an expense

### Settlement & Balance Endpoints (`/api/settlements`)
- `GET /api/settlements/group/{groupId}/balances` - View net balance for each group member
- `GET /api/settlements/group/{groupId}/suggestions` - Calculate minimum transaction suggestions using greedy cash flow algorithm
- `POST /api/settlements` - Record a settlement payment (`{ groupId, payerId, payeeId, amount, notes }`)
- `GET /api/settlements/group/{groupId}/history` - View recorded settlement payments history

---

##  Key Features & Algorithms

1. **Flexible Expense Splitting**:
   - **Equal (`=`)**: Total amount split evenly among participants (penny remainders handled automatically).
   - **Custom (`$`)**: Specify exact dollar amounts per person (validated against total amount).
   - **Percentage (`%`)**: Allocate percentages per person (validated to sum to 100%).

2. **Minimum Transactions Settlement Algorithm**:
   - Computes net balance ($Net_i = \text{Total Paid} + \text{Settlements Sent} - \text{Total Owed} - \text{Settlements Received}$).
   - Uses priority queues for debtors and creditors to compute the minimum number of money transfers needed to resolve all debts cleanly.

3. **Stateless JWT Security**:
   - Preflight `OPTIONS` requests allowed explicitly via `SecurityConfig` and `CorsConfig`.
   - Bearer token passed seamlessly in HTTP request headers.

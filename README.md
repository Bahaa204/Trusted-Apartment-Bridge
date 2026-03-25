# TAB – Trusted Apartment Bridge

Branch: Ali Yousef

TAB (Trusted Apartment Bridge) is a web-based real estate platform designed to bridge the gap between real estate agencies/builders and customers. It provides a centralized, trusted space for discovering apartment and building projects globally, while offering agencies and admins powerful tools to manage projects, statistics, finances, and employees.

---

## Project Overview

The real estate market is often fragmented, requiring customers to search across multiple websites or rely on intermediaries to find suitable properties. TAB solves this problem by acting as a single bridge between customers and real estate providers, making the process of discovering, managing, and analyzing real estate projects simpler and more transparent.

Customers can browse and explore apartment projects in detail, while agencies and builders can upload and manage their own listings. Platform admins retain full oversight of all projects and system activity.

---

## Target Users

- **Customers**: Users looking to buy or rent apartments or real estate projects locally or globally.
- **Real Estate Agencies & Builders**: Organizations that upload, manage, and analyze their own real estate projects.
- **Admins**: Platform managers with full system access, responsible for overseeing projects, finances, employees, and statistics.

---

## Core Value Proposition

TAB provides customers with a trusted, centralized platform to discover verified real estate projects without the need to search multiple sources. For agencies and builders, TAB serves as a digital bridge to customers, offering visibility, analytics, and management tools through a single dashboard. Admins benefit from complete system control and insights across all projects.

---

## Feature Scope (MVP)

The MVP (Minimum Viable Product) of TAB focuses on essential features required to demonstrate the platform’s core value:

### Customer Features

- Browse a list of apartment and building projects.
- Search and filter projects by criteria such as location, category, or price.
- View detailed project pages including descriptions, images, pricing, and location.

### Agency Features

- Secure authentication for agencies.
- Upload and manage their own real estate projects.
- View project-specific statistics such as number of views and user interest.

### Admin Features

- Secure admin dashboard.
- Full access to all projects and platform-wide statistics.
- View basic financial data related to projects.
- Manage employees (add, edit, remove).

---

## Routing & Navigation (Conceptual)

- Dynamic routes for project details (e.g., `/projects/[id]`).
- Query parameters for searching and filtering (e.g., `/projects?search=apartment&location=paris`).

---

## Data Model (High-Level)

Core entities include:

- Projects
- Agencies / Builders
- Users
- Employees
- Financial Records
- Statistics

---

## Authentication & Roles

- Role-based access control (Customer, Agency, Admin).
- Secure login using email and password.
- Restricted access to sensitive data such as financial records and employee management.

---

## Risks & Constraints

- Limited development time requires a strict MVP scope.
- Free-tier hosting and database limitations.
- Ensuring data security and role-based access control.
- Maintaining trust and accuracy of listed real estate projects.

---

## Notes

- TAB is currently an academic / MVP-level project.
- Buying or renting actions represent user intent or status changes, not real financial transactions.
- The platform is designed to be scalable for future enhancements such as payments, messaging, and advanced analytics.

---

## How to Run the Project

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A modern web browser

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Bahaa204/TAB.git
   cd TAB
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment configuration**
   - Create a `.env` file in the root directory.
   - Add required environment variables such as database connection strings and authentication secrets.

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the application**
   - Navigate to the link shown or press `o` then `enter` to open the website inside your browser.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

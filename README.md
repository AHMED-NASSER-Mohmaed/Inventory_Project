# 🛒 Nationwide eCommerce & Inventory Management System

This project is a full-featured **eCommerce and Inventory Management System** designed to handle both **online store operations** and **offline branches across multiple locations**. Built using the powerful **MEAN Stack** (MongoDB, Express.js, Angular, Node.js), the system supports **multi-role access**, **advanced order handling**, and **scalable inventory control** for real-world retail scenarios.

---

## 📦 Features

### 🌐 Online Store (Customer Portal)
- Browse products (from our system and hosted by external sellers)
- Add to cart, place orders, track delivery
- Write and read product reviews
- Cancel full orders or individual items (if pending)
- Integrated customer support system

### 🏢 Offline Branch Operations
- Walk-in customer order placement and payment
- Local branch inventory and employee management
- Full analytics per branch

---

## 🧠 User Roles & Responsibilities

### 🔑 Super Admin
- Add products from vendors (internal inventory)
- Accept/Reject product submissions from external sellers
- Add system employees (branch admins, clerks, cashiers)
- View global analytics and orders
- Manage platform commission policies
- Full control via the Super Admin Dashboard

### 🧭 Branch Admin
- Manage employees in assigned branch
- View branch-specific data and performance
- Has access to the Branch Admin Dashboard

### 🛍️ External Seller
- Submit product listings (new or existing system items)
- Manage orders from the online store
- Track reviews and product analytics
- Operate exclusively in the online store
- Dashboard access with stats and sales performance

### 🧾 Online Clerk
- Handles our internal orders from the online store
- Manages fulfillment and updates statuses
- Operates through the Online Clerk Dashboard

### 🧾 Offline Clerk
- Handles walk-in customer orders at physical branches
- Coordinates with offline cashier to complete transactions
- Uses a dedicated Offline Clerk interface

### 💳 Online Cashier
- Finalizes payments for online orders
- Collects money from delivery for our products
- Collects commission from external sellers
- Dashboard includes transaction tracking and summaries

### 💵 Offline Cashier
- Finalizes and handles payments in-store
- Only deals with our products (external sellers not available offline)

### 👤 Customer
- Shop from online store
- Track orders, write reviews, cancel if pending
- Communicate with customer service

---

## 🔐 Authentication System
- Separate login portals per role
- Distinct MongoDB collections for data isolation
- JWT for secure token-based authentication
- Role-Based Access Control (RBAC) across all roles

---

## 🧰 Tech Stack

| Layer        | Technology         |
|--------------|--------------------|
| Frontend     | Angular 19         |
| Backend      | Node.js, Express.js|
| Database     | MongoDB            |
| Authentication | JWT              |
| Styling      | Angular Material   |

---

## 🚀 Getting Started

### 🔧 Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)
- Angular CLI
- Git

### 📦 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ecommerce-inventory-system.git](https://github.com/AHMED-NASSER-Mohmaed/Inventory_Project.git
cd Inventory_Project

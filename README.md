# SARN - Baby Product E-Commerce Web Application

SARN is a full-stack baby product e-commerce web application developed for academic practicum purposes. The system allows customers to browse products, view product details, add products to cart, place orders, and allows admins to manage products, orders, and monthly sales reports.

## Features

### Customer Features
- Public landing page
- Product browsing
- Product details
- Shopping cart
- Checkout and order placement
- Order confirmation

### Admin Features
- Role-based admin login
- Admin dashboard
- Product add, edit, delete, and view
- Order approval
- Order cancellation
- Mark order as delivered
- Monthly sales report PDF download

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Python
- Django
- Django REST Framework
- SimpleJWT

### Database
- SQLite

### Other Tools
- ReportLab for PDF report generation
- Django media storage for product images
- Git and GitHub
- VS Code

## Project Structure

```text
ecommerce/
├── backend/
│   ├── accounts/
│   ├── backend/
│   ├── orders/
│   ├── products/
│   ├── media/
│   ├── db.sqlite3
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
└── README.md
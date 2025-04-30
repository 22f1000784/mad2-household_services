# mad2-household_services
# 🏠 Household Services Web Application

This is a full-stack web application that allows users to request and manage household services such as plumbing, cleaning, and electrical repairs. The system supports **role-based access control** for three user types: **Admin**, **Customer**, and **Service Professional**. It includes user authentication, task scheduling, email notifications, and a clean frontend interface.

---

## 🚀 Features

### 🔐 Authentication & Roles
- JWT-based user login and registration
- Role-based access for:
  - **Admin**: manage users, professionals, and view all service requests
  - **Customer**: book and manage household service requests
  - **Service Professional**: view and update assigned tasks

### 🛠 Backend Capabilities
- RESTful API built with Flask
- Background task processing using Celery and Redis
- Scheduled jobs (e.g., cleanup or notification) via Celery beat
- Email notifications for confirmations and updates

### 💻 Frontend (Vue.js)
- Dynamic interface based on user roles
- Login, registration, and service request forms
- Responsive UI using Bootstrap CDN

---

## 🧱 Tech Stack

### Backend:
- Python (Flask)
- Flask-Security for authentication and roles
- Celery + Redis for background and scheduled tasks
- SQLAlchemy ORM for database modeling
- SQLite/PostgreSQL (configurable)

### Frontend:
- Vue.js
- Bootstrap (via CDN)

---

## 📁 Project Structure

. ├── main.py # Main app and scheduler ├── resources.py # API endpoints ├── task.py # Celery tasks ├── worker.py # Celery worker config ├── models.py # SQLAlchemy models ├── config.py # App configuration ├── database.py # Database setup ├── mail_service.py # Email functionality ├── celery_config.py # Celery + Redis configuration ├── templates/ # HTML templates ├── static/ # CSS/JS assets ├── requirements.txt # Python dependencies └── myvenv/ # Virtual environment

# Development Setup & Execution Guide - JuanClinic HIS

This guide provides the necessary steps to set up and run the JuanClinic Health Information System (HIS) in a development environment.

## 1. Prerequisites
Ensure you have the following installed on your system:
- **PHP 8.2+** (with standard extensions: `mbstring`, `xml`, `bcmath`, `curl`)
- **Composer** (PHP dependency manager)
- **Node.js** (v18+ recommended) & **npm**
- **MySQL 8.0+**
- **Git**

---

## 2. Backend Setup (Laravel)

### Step 1: Environment Configuration
1. Navigate to the `backend` directory.
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your database credentials and other configuration:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=juanclinic
   DB_USERNAME=root
   DB_PASSWORD=
   ```

### Step 2: Install Dependencies
```bash
composer install
```

### Step 3: Generate Application Key
```bash
php artisan key:generate
```

### Step 4: Database Migrations & Seeding
Ensure your MySQL server is running and the database specified in `.env` exists.
```bash
php artisan migrate --seed
```

### Step 5: Start Services
The backend requires both the HTTP server and the Reverb (WebSocket) server.

1. **Start the API Server:**
   ```bash
   php artisan serve --port=8001
   ```
2. **Start the Reverb Server:**
   ```bash
   php artisan reverb:start --port=8080
   ```

---

## 3. Frontend Setup (ReactJS)

### Step 1: Install Dependencies
Navigate to the `frontend` directory:
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
The frontend will typically be accessible at `http://localhost:5173`.

---

## 4. Operational Gating (Post-Setup)
Once the application is running, ensure you follow the [Operational Protocol](Operational_protocol.md) for any development tasks:
- **Tenant Isolation**: Verify that the correct tenant_id is scoped in your queries.
- **Audit Logging**: Confirm that administrative actions are being logged.
- **Clinical Integrity**: Use the [DS-012 Stitch Workflow](.agents/workflows/stitch-workflow.md) for UI changes.

---

## 5. Troubleshooting
- **502 Bad Gateway**: Check that `php-fpm` is running and that Nginx is correctly configured if using a local web server (non-artisan).
- **CORS Errors**: Ensure your `frontend` URL is added to the `SANCTUM_STATEFUL_DOMAINS` and `CORS_ALLOWED_ORIGINS` in `backend/.env`.
- **Database Connection**: Verify your `DB_*` credentials in `.env` match your local MySQL configuration.

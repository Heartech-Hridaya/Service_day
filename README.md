# ServiceDayDashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.




# Service Day Dashboard: Architecture & Library Report

This report provides a comprehensive overview of the libraries utilized within the **Service Day Dashboard** project, how they function together, and a breakdown of the key files driving the application's behavior.

## 📦 Core Libraries Used

### 1. Angular Core & Common (`@angular/core`, `@angular/common`, `@angular/router`)
*   **Version:** 17.3.0
*   **Purpose:** The foundational framework powering the Single Page Application (SPA).
*   **How it works:** Angular uses a component-based architecture where the UI is broken down into encapsulated elements (components). It uses `@angular/router` to handle client-side navigation between the login, admin, and employee views without reloading the page. It heavily utilizes Angular's built-in dependency injection for services (like `AuthService` and `NgoService`).

### 2. RxJS (`rxjs`)
*   **Version:** 7.8.0
*   **Purpose:** Reactive programming library for handling asynchronous data streams.
*   **How it works:** Since there is no physical backend, RxJS `BehaviorSubject` instances are used in the application's services (`NgoService`, `RegistrationService`, `NotificationService`) to act as an in-memory data store. Components subscribe to these observables using the `async` pipe in HTML templates, ensuring the UI updates automatically and efficiently whenever the underlying data changes.

### 3. Chart.js & ng2-charts (`chart.js`, `ng2-charts`)
*   **Version:** 4.4.1 (Chart.js), 5.0.4 (ng2-charts)
*   **Purpose:** Data visualization for the administrative dashboard.
*   **How it works:** `ng2-charts` provides Angular wrapper components around the vanilla `Chart.js` canvas library. In the `DashboardComponent`, it consumes the RxJS streams of registered NGOs and total slots, and visually maps them into a responsive stacked bar chart comparing "Slots Booked" vs "Slots Remaining".

### 4. QRCode (`qrcode`, `@types/qrcode`)
*   **Version:** 1.5.4
*   **Purpose:** Generating check-in QR codes for specific NGO events.
*   **How it works:** This utility library takes a JSON payload (containing the event's `ngoId`) and converts it into a Base64 Data-URL representing a QR code image. This image is then bound directly to an `<img>` tag in the `ManageNgosComponent` template using Angular data binding.

### 5. Angular Animations (`@angular/animations`)
*   **Version:** 17.3.0
*   **Purpose:** Providing smooth UI transitions.
*   **How it works:** Used to define complex entry and exit animations. By combining `trigger`, `query`, and `stagger`, the application gracefully fades and slides in list items (like the NGO cards and table rows) sequentially when they enter the DOM.

---

## 📂 Project Structure & File Roles

The application is structured into domain-driven feature modules.

### Root Level
*   **`app.module.ts` / `app.component.ts`:** The root entry point of the application. `app.component.ts` also contains a global background loop that routinely checks scheduled reminders and triggers them if the appropriate time interval has passed.
*   **`app-routing.module.ts`:** Handles top-level routing, applying route guards (`AdminGuard`, `EmployeeGuard`) to protect authenticated paths.
*   **`styles.css`:** The global stylesheet containing all CSS variables (design tokens), typography settings, and shared utility classes (`.panel`, `.header-actions`, `.btn-primary`, `.status-badge`) used universally across components.

### Shared & Services (`src/app/services/` & `src/app/shared/`)
*   **`auth.service.ts`:** Manages the active user session and validates login credentials against hardcoded user objects.
*   **`ngo.service.ts`:** The source of truth for NGO activity data. Handles CRUD operations for activities and slot capacity tracking.
*   **`registration.service.ts`:** Manages which employee is registered for which activity and tracks real-time check-in arrival states.
*   **`notification.service.ts`:** A global message bus handling scheduled communications, admin broadcasts, and automated cancellation alerts.
*   **`toast.service.ts` / `navbar.component.ts`:** Shared UI elements. The Navbar provides navigation and the notification bell, while the Toast service provides non-intrusive floating alert messages.

### Admin Module (`src/app/admin/`)
*   **`dashboard.component.ts`:** The central command center. Aggregates data from all services to display high-level stats, the `ng2-charts` visualizer, live real-time check-ins for the day, and quick broadcast tools.
*   **`manage-ngos.component.ts`:** The administrative CRUD interface. Allows admins to add new activities, edit details, upload cover images (via `FileReader`), and generate check-in QR codes.
*   **`communications.component.ts`:** The advanced scheduling interface allowing admins to target specific audiences and delay message delivery based on time constraints (e.g., "1 day before event").
*   **`attendance.component.ts`:** A global ledger reconciling all registered volunteers with their actual arrival timestamps.

### Employee Module (`src/app/employee/`)
*   **`ngo-list.component.ts`:** The primary volunteer interface displaying available activities as aesthetic cards. Evaluates slot availability and prevents duplicate registrations.
*   **`my-registrations.component.ts`:** Allows users to view their active commitments and cancel them, provided the event's cutoff date has not passed.
*   **`check-in.component.ts`:** The end-user interface simulating a QR code scan. Allows employees to mark themselves as "Checked In", which instantly reflects on the Admin Dashboard via RxJS streams.
*   **`profile.component.ts` / `notifications.component.ts`:** User management views for updating contact details and reading broadcasted messages/alerts.

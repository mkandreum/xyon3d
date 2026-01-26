# Bug & Failure Audit Report

## 🚨 Critical Failures Found

### 1. Missing Payment Webhook (CRITICAL)
*   **Location**: `server/index.js`
*   **Description**: The MONEI payment creation configures a `callbackUrl` pointing to `/api/monei/webhook`. However, **this route does not exist** in the server code.
*   **Consequence**: Payments will be processed by your customers, money will be taken from their accounts, but **your database will never know**. Orders will stay in `pending` status forever. The "Payment Success" page relies on client-side redirection which is unreliable and insecure for marking orders as paid.
*   **Fix**: Implement `POST /api/monei/webhook` to handle MONEI notifications and update order status.

### 2. Environment Variable Dependency
*   **Location**: `server/index.js` (MONEI config)
*   **Description**: `callbackUrl` defaults to `http://localhost:3000` if `SERVICE_URL_APP` is not set.
*   **Consequence**: In production (Coolify), if you forget to set `SERVICE_URL_APP` (or `COOLIFY_URL`), MONEI will try to send webhooks to `localhost`, which will fail.
*   **Fix**: Ensure `SERVICE_URL_APP` is set in your deployment environment.

### 3. Missing Error Handling for Redirects
*   **Location**: `server/index.js` (`create-payment`)
*   **Description**: The code assumes `payment.nextAction.redirectUrl` always exists. If MONEI returns a status other than `PENDING` (e.g., `FAILED` immediately), this might throw or return undefined.
*   **Fix**: Add checks for `payment.status` before assuming a redirect is needed.

---

## ✅ Recommended Immediate Actions

1.  **Implement Webhook Endpoint**: Add the listener for MONEI events.
2.  **Verify Order Update Logic**: Ensure the webhook updates the `orders` table `status` to `confirmed` or `paid`.

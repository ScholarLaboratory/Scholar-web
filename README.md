# Scholar Web

Next.js App Router frontend for Scholar Laboratory, with TypeScript, Tailwind CSS v4, and shadcn/ui-compatible components.

## Local development

1. Install Node.js 20+ and pnpm.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env.local`. Set `SCHOLAR_API_URL` to the running NestJS backend URL ending in `/api/v1`.
4. Start the NestJS API, then run `pnpm dev`.
5. Open `http://localhost:3000`.

Available pages: `/`, `/register`, `/login`, `/dashboard`.

Registration and login use server-side Next.js route handlers. Login stores the backend JWT in an HttpOnly, SameSite=Lax cookie, not localStorage. The dashboard validates the token against `GET /auth/me`. Registration redirects to login; logout clears the frontend cookie.

**Before production:** configure HTTPS, align cookie lifetime with backend JWT expiration, implement CSRF defenses for authenticated mutations, and complete integration tests. Backend must be accessible from the Next.js server.

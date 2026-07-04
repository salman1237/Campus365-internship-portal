# Campus365 Internship Application Portal

Welcome to the **Campus365 Internship Application Portal** repository. This is a modern, high-performance web application built for Skoder Technologies to seamlessly handle incoming internship applications, manage assets, and dynamically generate highly customized DOCX documents (Non-Disclosure Agreements and Appointment Letters).

---

## 🚀 Features

- **Stunning UI/UX**: Features a highly aesthetic, dark-mode glassmorphism landing page and application form with custom CSS animations and gradient blobs.
- **Dynamic Content Management**: The landing page's main headers, automated cycling text, and badges can be updated instantly from the Admin dashboard—without redeploying or altering the database schema.
- **Application Tracking**: A dedicated admin panel where you can view all applicants' details (Name, Email, Phone, Institution) in real-time.
- **Instant Document Generation**: At the click of a button, generate perfectly formatted Word Documents (`.docx`) for NDAs and Appointment Letters tailored to the specific applicant.
  - The document generation enforces strict styling rules (1 inch margins, exact 1.3/1.5 line heights, 12pt paragraph gaps, and inline custom fonts).
- **Secure Route Protection**: Sensitive generator routes (`/nda` and `/appointment-letter`) are completely locked down behind authentication middleware.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start/latest) / [React](https://react.dev/)
- **Build Tool / Server**: [Vite](https://vitejs.dev/) + Nitro (currently configured for Cloudflare/Vercel)
- **Routing**: `@tanstack/react-router` (File-based routing)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL + Storage)
- **Document Generation**: `docx` package for building native Word documents on the fly.

---

## 🔐 Admin Credentials

To access the backend Admin Dashboard (located at `/admin`), use the following secured credentials:

- **Username**: `admin@campus365`
- **Password**: `PassAd`

> **Note:** Access to the `Submitted Applications`, `Asset Management`, `Landing Page Settings`, and the document generator routes is restricted to authorized admins only.

---

## 💻 Local Development

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- A Supabase Project (for DB and Storage)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pad-pal-designer-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Ensure you have your `.env` file set up in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:8080`.

---

## 🚢 Deployment

This application is built on the Nitro engine and is highly portable. It can be natively deployed on services like **Vercel** or **Cloudflare Pages**.

**To Deploy on Vercel:**
1. Import the repository in Vercel.
2. Set the Build Command to `npm run build`.
3. Add an Environment Variable: `NITRO_PRESET=vercel` (This overrides the default Cloudflare build target).
4. Add your Supabase environment variables.
5. Hit **Deploy**.

---

## 📁 Storage Buckets

The application relies on Supabase Storage buckets to function correctly:
- **`logos`**: Used for storing asset management images (e.g., custom partner logos) AND the dynamically updated `landing-config.json` file. Ensure this bucket is set to **Public**.

# RecruitPro

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth.js (Authentication)
- React Hook Form + Zod (Validation)
- Cloudinary (Resume/Image Uploads)

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd recruitpro
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your database and Cloudinary credentials.

4. **Set up the database:**
   ```sh
   npx prisma migrate dev
   ```

5. **Run the development server:**
   ```sh
   npm run dev
   ```

6. **Open the app:**
   - Go to [http://localhost:3000](http://localhost:3000)

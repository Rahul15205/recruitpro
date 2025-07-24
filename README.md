# RecruitPro - Modern Job Portal Application

A comprehensive job portal application built with Next.js 14, featuring job posting, application management, and administrative tools for recruiters and job seekers.

## 🚀 Features

### For Job Seekers
- **Job Search & Filtering**: Search jobs by title, location, type, and company
- **Job Applications**: Apply to jobs with resume upload and cover letters
- **Application Tracking**: Track application status and history
- **Profile Management**: Manage personal information and preferences

### For Employers/Admins
- **Job Management**: Create, edit, and manage job postings
- **Application Review**: Review candidate applications with detailed views
- **Status Management**: Update application statuses (pending, reviewed, accepted, rejected)
- **Analytics Dashboard**: View application statistics and metrics
- **Resume Downloads**: Download candidate resumes
- **Internal Notes**: Add private notes for applications

### General Features
- **Responsive Design**: Mobile-first, fully responsive UI
- **Authentication**: Secure user authentication and authorization
- **Real-time Updates**: Dynamic content updates
- **Modern UI**: Clean, professional interface with Tailwind CSS

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with PostgreSQL/SQLite
- **Authentication**: NextAuth.js
- **UI Components**: Headless UI, Heroicons
- **File Upload**: File handling for resume uploads
- **State Management**: React hooks and server components

## 📁 Project Structure

```
recruitpro/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin-specific endpoints
│   │   │   ├── applications/  # Application management
│   │   │   ├── auth/          # Authentication
│   │   │   ├── jobs/          # Job management
│   │   │   └── user/          # User management
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── applications/  # Application management UI
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   └── jobs/          # Job management UI
│   │   ├── jobs/              # Public job pages
│   │   ├── auth/              # Authentication pages
│   │   └── components/        # Reusable UI components
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── uploads/                   # File upload directory
```

## 🗄️ Database Schema

The application uses Prisma ORM with the following main entities:

- **User**: User accounts with role-based access
- **Job**: Job postings with details and requirements
- **Application**: Job applications linking users and jobs
- **Company**: Company information and profiles

## 🔌 API Endpoints

### Public Endpoints
- `GET /api/jobs` - List all jobs with filtering
- `GET /api/jobs/[id]` - Get specific job details
- `POST /api/applications` - Submit job application

### Admin Endpoints
- `GET /api/admin/jobs` - Manage job postings
- `GET /api/admin/applications` - List applications
- `GET /api/admin/applications/[id]` - Get application details
- `PUT /api/admin/applications/[id]` - Update application status
- `GET /api/admin/stats` - Get dashboard statistics

### User Endpoints
- `GET /api/user/applications` - User's application history
- `POST /api/applications/check/[jobId]` - Check application status

## 🔐 Authentication & Authorization

- **NextAuth.js** integration for secure authentication
- **Role-based access control** (Admin, User)
- **Protected routes** for admin and user-specific features
- **Session management** with JWT tokens

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design
- **Interactive Components**: Modals, dropdowns, and form validation
- **Loading States**: Proper loading indicators and error handling
- **Accessibility**: ARIA labels and keyboard navigation support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- PostgreSQL or SQLite database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recruitpro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL="your-database-connection-string"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   # or for migrations
   npx prisma migrate dev
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### For Job Seekers
1. **Browse Jobs**: Visit the homepage to see available positions
2. **Apply**: Click on jobs to view details and submit applications
3. **Track Applications**: View your application status in your profile

### For Administrators
1. **Access Admin Panel**: Navigate to `/admin/dashboard`
2. **Manage Jobs**: Create and edit job postings
3. **Review Applications**: View and process candidate applications
4. **Update Status**: Change application statuses and add notes

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Tailwind CSS** for consistent styling

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically on push

### Other Platforms
- **Netlify**: Use `npm run build` and deploy the `out` folder
- **Docker**: Use the included Dockerfile
- **Self-hosted**: Use `npm run build && npm run start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/recruitpro/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- Prisma for the modern database toolkit
- All contributors and users of this project

---

**RecruitPro** - Connecting talent with opportunity 🚀

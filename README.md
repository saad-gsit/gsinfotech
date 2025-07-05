# GS Infotech - Enhanced MERN Stack Development

🚀 **Leading Software Development Company** built with modern technologies and enhanced UI/UX

## 📋 Project Overview

GS Infotech is a comprehensive software development company website built using the Enhanced MERN Stack with modern UI/UX components, SEO optimization, and advanced content management capabilities. This project follows a systematic 19-phase development approach for building high-performance, scalable web applications.

## 🛠️ Enhanced Technology Stack

### Frontend Stack
- **Vite + React.js** - Fast development and optimal builds
- **Tailwind CSS** - Utility-first styling system
- **Material-UI (MUI)** - Professional admin dashboard components
- **Framer Motion** - Eye-catching animations and transitions
- **React Helmet Async** - SEO and meta tag management
- **TanStack Query** - Efficient data fetching and caching
- **React Hook Form + Yup** - Form handling and validation
- **React Hot Toast** - Notifications
- **React Dropzone** - File upload components
- **TinyMCE** - Rich text editor for blog
- **Recharts** - Analytics dashboard charts
- **React Intersection Observer** - Lazy loading and scroll animations

### Backend Stack
- **Node.js + Express.js** - Server framework
- **MySQL + Sequelize** - Database and ORM
- **Helmet.js** - Security headers
- **Sharp** - Image optimization
- **Nodemailer** - Email services
- **Winston** - Logging system
- **Express Rate Limit** - API protection

### SEO & Performance
- **Workbox** - PWA capabilities
- **React Image** - Optimized image loading
- **Bundle Analyzer** - Build optimization
- **Sitemap Generator** - SEO sitemap
- **Structured Data** - Rich snippets

### Developer Tools
- **ESLint + Prettier** - Code quality
- **Husky** - Git hooks
- **Vite Bundle Analyzer** - Performance monitoring

## 📁 Project Structure

```
gsinfotech/
├── README.md
├── .gitignore
├── docker-compose.yml
├── package.json (workspace)
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   ├── cors.js
│   │   ├── security.js
│   │   └── email.js
│   ├── models/
│   │   ├── index.js
│   │   ├── Project.js
│   │   ├── TeamMember.js
│   │   ├── BlogPost.js
│   │   ├── Service.js
│   │   ├── CompanyInfo.js
│   │   ├── ContactSubmission.js
│   │   ├── SEOMetadata.js
│   │   └── Analytics.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   ├── migrations/
│   ├── seeders/
│   ├── tests/
│   └── public/
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── .env.example
│   ├── .env
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── assets/
│   ├── public/
│   └── dist/
└── docs/
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saad-gsit/gsinfotech
   cd gsinfotech
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   ```

4. **Database Setup**
   ```bash
   cd ../server
   
   # Create database
   mysql -u root -p -e "CREATE DATABASE gsinfotech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   
   # Run migrations
   npm run db:migrate
   
   # Seed database with demo data
   npm run db:seed
   ```

## 🏃‍♂️ Development Commands

### Start Development Servers
```bash
# Both frontend and backend
npm run dev:all

# Backend only
npm run dev:server

# Frontend only
npm run dev:client
```

### Database Operations
```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset and reseed
npm run db:reset
```

### Testing
```bash
# All tests
npm run test:all

# Performance tests
npm run test:performance

# SEO validation
npm run test:seo
```

### Build and Optimization
```bash
# Build with bundle analysis
npm run build:analyze

# Production build
npm run build:prod

# Image optimization
npm run optimize:images
```

### Performance Monitoring
```bash
# Performance analysis
npm run audit:performance

# SEO audit
npm run audit:seo

# Security audit
npm run audit:security

# Bundle analysis
npm run analyze:bundle

# Dependency analysis
npm run analyze:deps
```

## 📊 Database Schema

### Tables Created
- **projects** - Project portfolio with SEO fields and gallery support
- **team_members** - Team profiles with skills, social links, and expertise levels
- **blog_posts** - Blog system with reading time, categories, and structured data
- **services** - Service offerings with pricing models and process steps
- **company_info** - Dynamic company information with categorized settings
- **contact_submissions** - Contact form data storage
- **seo_metadata** - Page-specific SEO management with structured data
- **analytics** - Basic analytics data collection

### Demo Data Includes
- 4 sample projects (e-commerce, healthcare, mobile app, CRM)
- 5 team member profiles with complete information
- 3 blog posts with full content and SEO metadata
- 5 service offerings with detailed descriptions
- 14 company information entries
- 9 SEO metadata entries for all major pages

## 🎯 Features

### Core Features
- ✅ Responsive design with Tailwind CSS + MUI
- ✅ SEO-optimized pages with structured data
- ✅ Professional admin dashboard
- ✅ Content management system
- ✅ Blog system with rich text editor
- ✅ Project portfolio showcase
- ✅ Team member profiles
- ✅ Service offerings management
- ✅ Contact form with validation

### Advanced Features
- 🔄 Real-time analytics dashboard
- 🎨 Professional animations with Framer Motion
- 📱 Progressive Web App (PWA) capabilities
- 🚀 Performance optimized (sub-2 second loading)
- 🔍 Advanced SEO with dynamic meta tags
- 📊 Built-in analytics and monitoring
- 🛡️ Security headers and rate limiting
- 📧 Email integration with templates

## 📈 Performance Targets

- **Page Load Time**: < 2 seconds (First Contentful Paint)
- **Lighthouse Score**: 90+ (Performance, SEO, Accessibility)
- **Core Web Vitals**: Green scores for LCP, FID, CLS
- **Bundle Size**: < 250KB initial bundle

## 🎨 SEO Targets

- **Keyword Rankings**: Top 10 for primary keywords
- **Organic Traffic**: 50% increase in 6 months
- **Technical SEO Score**: 95+
- **Schema Markup**: 100% implementation

## 👥 User Experience Targets

- **Animation Performance**: 60fps on mid-range devices
- **Mobile Experience**: Perfect mobile usability score
- **Accessibility**: WCAG 2.1 AA compliance
- **User Engagement**: 40% increase in session duration

## 🔧 Environment Variables

### Server (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gsinfotech_db
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GS Infotech
VITE_NODE_ENV=development
```

## 📝 Development Phases

This project follows a 19-phase development approach:

- ✅ **Phase 1**: Enhanced Foundation Setup
- ✅ **Phase 2**: Enhanced Database Design
- 🔄 **Phase 3**: Enhanced Backend API (In Progress)
- ⏳ **Phase 4**: Enhanced Frontend Foundation
- ⏳ **Phase 5**: HTML to React Conversion
- ⏳ **Phase 6**: Professional Admin Dashboard
- ⏳ **Phase 7**: SEO Optimization
- ⏳ **Phase 8**: Performance Optimization
- ⏳ **Phase 9**: PWA Implementation
- ⏳ **Phase 10**: Real-time Analytics Dashboard
- ⏳ **Phase 11**: Enhanced Content Management
- ⏳ **Phase 12**: Enhanced Blog System
- ⏳ **Phase 13**: Performance Optimization (Sub-2 Second Loading)
- ⏳ **Phase 14**: SEO-Optimized Pages with Target Keywords
- ⏳ **Phase 15**: Enhanced Contact Form
- ⏳ **Phase 16**: Animation Implementation
- ⏳ **Phase 17**: Testing and Quality Assurance
- ⏳ **Phase 18**: Deployment and Production Optimization
- ⏳ **Phase 19**: Launch Preparation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**GS Infotech Development Team**
- Website: [https://gsinfotech.com](https://gsinfotech.com)
- Email: info@gsinfotech.com
- LinkedIn: [GS Infotech](https://linkedin.com/company/gsinfotech)

## 🙏 Acknowledgments

- Enhanced MERN Stack Development Guide
- Modern UI/UX Design Principles
- SEO Best Practices
- Performance Optimization Techniques

---


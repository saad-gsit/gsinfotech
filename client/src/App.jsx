// Enhanced client/src/App.jsx - Aligned with Redesign Theme
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Global, css } from '@emotion/react'
import { HelmetProvider } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

// Store
import store from './store'
import { verifyToken } from './store/slices/authThunks'

// Layout
import Layout from './components/Layout/Layout'
import AdminLayout from './components/Layout/AdminLayout'

// Components
import Toast from './components/UI/Toast'
import PageLoader from './components/UI/PageLoader'
import ScrollToTop from './components/UI/ScrollToTop'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Team from './pages/Team'
import Blog from './pages/Blog'
import Contact from './pages/Contact'

// Admin Pages
import Login from './pages/admin/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminServices from './pages/admin/AdminServices'

// Import your actual admin components
import ProjectsManager from './components/Admin/ProjectsManager'
import BlogManager from './components/Admin/BlogManager'
import ContactsManager from './components/Admin/ContactsManager'
import TeamManager from './components/Admin/TeamManager'
import ServicesManager from './components/Admin/ServicesManager'

// Auth Guard
import AuthGuard from './components/Admin/AuthGuard'

// Test
import APITest from './components/Test/APITest'

// Enhanced fallback component with redesign theme
const FallbackPage = ({ title, description = "We're crafting something extraordinary. Check back soon!" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
    style={{
      background: `linear-gradient(135deg, 
        rgba(240, 237, 228, 0.8) 0%, 
        rgba(245, 241, 235, 0.9) 50%, 
        rgba(250, 246, 240, 1) 100%)`
    }}
  >
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{ backgroundColor: '#8B9471' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full"
        style={{ backgroundColor: '#F5B5A6' }}></div>
    </div>

    <div className="text-center max-w-3xl relative z-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Icon */}
        <div className="mb-12">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 mx-auto mb-8 relative"
          >
            <div
              className="w-full h-full rounded-2xl shadow-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #8B9471 0%, #6B7658 100%)`,
                boxShadow: '0 25px 50px -12px rgba(139, 148, 113, 0.4)'
              }}
            >
              <div className="absolute inset-0 bg-white/20 transform rotate-45 translate-x-12 transition-transform duration-700 hover:translate-x-[-100%]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-6xl md:text-7xl font-bold mb-6"
          style={{
            background: `linear-gradient(135deg, #8B9471 0%, #6B7658 50%, #5A6148 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xl md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto"
          style={{ color: '#6B7280' }}
        >
          {description}
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.a
            href="/"
            whileHover={{
              scale: 1.05,
              y: -2,
              boxShadow: '0 20px 40px -12px rgba(139, 148, 113, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-medium text-lg transition-all duration-300 group"
            style={{
              background: `linear-gradient(135deg, #8B9471 0%, #6B7658 100%)`,
              boxShadow: '0 10px 30px -10px rgba(139, 148, 113, 0.3)'
            }}
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return Home
            <div className="absolute inset-0 rounded-2xl bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </motion.a>
        </motion.div>
      </motion.div>
    </div>

    {/* Floating Elements */}
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, 0]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full opacity-30"
      style={{ backgroundColor: '#F5B5A6' }}
    />
    <motion.div
      animate={{
        y: [0, 15, 0],
        rotate: [0, -5, 0]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
      className="absolute bottom-1/3 left-1/4 w-6 h-6 rounded-full opacity-20"
      style={{ backgroundColor: '#8B9471' }}
    />
  </motion.div>
)

// Fallback imports for missing pages
const BlogPost = () => <FallbackPage title="Blog Post" description="Discover insights and stories from our digital innovation journey." />
const TeamMember = () => <FallbackPage title="Team Member" description="Meet the creative minds behind our digital excellence." />
const NotFound = () => <FallbackPage title="404" description="The page you're looking for seems to have wandered off into the digital realm." />

// Admin pages with AuthGuard
const AdminProjects = () => (
  <AuthGuard permissions={{ resource: 'projects', action: 'read' }}>
    <ProjectsManager />
  </AuthGuard>
)

const AdminServicesPage = () => (
  <AuthGuard permissions={{ resource: 'services', action: 'read' }}>
    <ServicesManager />
  </AuthGuard>
)

const AdminBlog = () => (
  <AuthGuard permissions={{ resource: 'blog', action: 'read' }}>
    <BlogManager />
  </AuthGuard>
)

const AdminTeam = () => (
  <AuthGuard permissions={{ resource: 'team', action: 'read' }}>
    <TeamManager />
  </AuthGuard>
)

const AdminContacts = () => (
  <AuthGuard permissions={{ resource: 'contacts', action: 'read' }}>
    <ContactsManager />
  </AuthGuard>
)

const AdminAnalytics = () => <FallbackPage title="Analytics Dashboard" description="Comprehensive insights and performance metrics for your digital presence." />
const AdminSettings = () => <FallbackPage title="System Settings" description="Configure and customize your administration preferences." />

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// Enhanced theme with redesign colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B9471', // Olive Green
      light: '#A8B589',
      dark: '#6B7658',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F5B5A6', // Peach
      light: '#F8C7BA',
      dark: '#E89080',
      contrastText: '#2D2D2D',
    },
    background: {
      default: '#FAF8F5', // Warm white
      paper: '#F8F6F0',   // Beige tint
    },
    text: {
      primary: '#2D2D2D',   // Dark grey
      secondary: '#6B7280', // Medium grey
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#2D2D2D',
      900: '#1F2937',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.7,
      letterSpacing: '0.01em',
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 4px -1px rgba(139, 148, 113, 0.1), 0 4px 8px -2px rgba(139, 148, 113, 0.1)',
    '0 4px 8px -2px rgba(139, 148, 113, 0.15), 0 8px 16px -4px rgba(139, 148, 113, 0.15)',
    '0 8px 16px -4px rgba(139, 148, 113, 0.2), 0 16px 32px -8px rgba(139, 148, 113, 0.2)',
    '0 16px 32px -8px rgba(139, 148, 113, 0.25), 0 32px 64px -16px rgba(139, 148, 113, 0.25)',
    // Add more shadows as needed...
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 24px -8px rgba(139, 148, 113, 0.3)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #8B9471 0%, #6B7658 100%)',
          color: '#FFFFFF',
          boxShadow: '0 4px 12px -2px rgba(139, 148, 113, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9FA685 0%, #7A8366 100%)',
            boxShadow: '0 12px 24px -8px rgba(139, 148, 113, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F6F0 100%)',
          boxShadow: '0 8px 32px -8px rgba(139, 148, 113, 0.15)',
          border: '1px solid rgba(139, 148, 113, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px -12px rgba(139, 148, 113, 0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F6F0 100%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139, 148, 113, 0.1)',
          boxShadow: '0 4px 20px -4px rgba(139, 148, 113, 0.15)',
        },
      },
    },
  },
})

// Enhanced Global Styles with redesign aesthetics
const GlobalStyles = () => (
  <Global
    styles={css`
      /* Custom scrollbar with theme colors */
      ::-webkit-scrollbar {
        width: 12px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(248, 246, 240, 0.5);
        border-radius: 6px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #8B9471 0%, #6B7658 100%);
        border-radius: 6px;
        border: 2px solid rgba(248, 246, 240, 0.5);
        transition: all 0.3s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #9FA685 0%, #7A8366 100%);
        border: 2px solid rgba(248, 246, 240, 0.3);
      }

      /* Enhanced selection color */
      ::selection {
        background: rgba(139, 148, 113, 0.25);
        color: #2D2D2D;
      }

      ::-moz-selection {
        background: rgba(139, 148, 113, 0.25);
        color: #2D2D2D;
      }

      /* Smooth scroll behavior */
      html {
        scroll-behavior: smooth;
        font-size: 16px;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #FAF8F5 0%, #F5F1EB 100%);
        color: #2D2D2D;
        line-height: 1.7;
        overflow-x: hidden;
      }

      /* Enhanced gradient text utilities */
      .gradient-text-primary {
        background: linear-gradient(135deg, #8B9471 0%, #6B7658 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .gradient-text-secondary {
        background: linear-gradient(135deg, #F5B5A6 0%, #E89080 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* Enhanced animations */
      @keyframes float {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg); 
        }
        33% { 
          transform: translateY(-10px) rotate(1deg); 
        }
        66% { 
          transform: translateY(-5px) rotate(-1deg); 
        }
      }

      @keyframes pulse-glow {
        0%, 100% { 
          box-shadow: 0 0 20px rgba(139, 148, 113, 0.2);
        }
        50% { 
          box-shadow: 0 0 40px rgba(139, 148, 113, 0.4);
        }
      }

      @keyframes shimmer {
        0% { 
          background-position: -200% 0; 
        }
        100% { 
          background-position: 200% 0; 
        }
      }

      .animate-float {
        animation: float 8s ease-in-out infinite;
      }

      .animate-pulse-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }

      .animate-shimmer {
        background: linear-gradient(90deg, transparent 0%, rgba(139, 148, 113, 0.1) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: shimmer 2s ease-in-out infinite;
      }

      /* Focus styles */
      *:focus-visible {
        outline: 2px solid #8B9471;
        outline-offset: 2px;
        border-radius: 4px;
      }

            /* Custom button hover effects */
      .btn-primary {
        background: linear-gradient(135deg, #8B9471 0%, #6B7658 100%);
        border: none;
        color: white;
        padding: 12px 28px;
        border-radius: 12px;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -8px rgba(139, 148, 113, 0.4);
      }

      .btn-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      .btn-primary:hover::before {
        left: 100%;
      }

      .btn-secondary {
        background: linear-gradient(135deg, #F5B5A6 0%, #E89080 100%);
        border: none;
        color: #2D2D2D;
        padding: 12px 28px;
        border-radius: 12px;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -8px rgba(245, 181, 166, 0.4);
      }

      /* Card enhancements */
      .card-elevated {
        background: linear-gradient(145deg, #FFFFFF 0%, #F8F6F0 100%);
        border-radius: 20px;
        border: 1px solid rgba(139, 148, 113, 0.1);
        box-shadow: 0 8px 32px -8px rgba(139, 148, 113, 0.15);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .card-elevated::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(139, 148, 113, 0.3), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .card-elevated:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px -12px rgba(139, 148, 113, 0.25);
      }

      .card-elevated:hover::before {
        opacity: 1;
      }

      /* Loading spinner */
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(139, 148, 113, 0.2);
        border-top: 3px solid #8B9471;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Text utilities */
      .text-balance {
        text-wrap: balance;
      }

      .text-gradient-animate {
        background: linear-gradient(45deg, #8B9471, #F5B5A6, #6B7280, #8B9471);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradient-shift 4s ease infinite;
      }

      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* Responsive enhancements */
      @media (max-width: 768px) {
        .card-elevated {
          border-radius: 16px;
          margin: 0 8px;
        }

        .btn-primary, .btn-secondary {
          padding: 10px 20px;
          font-size: 0.9rem;
        }
      }

      /* Dark mode support (future enhancement) */
      @media (prefers-color-scheme: dark) {
        .card-elevated {
          background: linear-gradient(145deg, #2D2D2D 0%, #1F2937 100%);
          border: 1px solid rgba(139, 148, 113, 0.2);
        }
      }

      /* Print styles */
      @media print {
        .no-print {
          display: none;
        }

        body {
          background: white;
          color: black;
        }
      }
    `}
  />
)

// Enhanced Page transition wrapper with more sophisticated animations
const PageTransition = ({ children, pageKey }) => (
  <motion.div
    key={pageKey}
    initial={{
      opacity: 0,
      y: 20,
      scale: 0.98
    }}
    animate={{
      opacity: 1,
      y: 0,
      scale: 1
    }}
    exit={{
      opacity: 0,
      y: -20,
      scale: 1.02
    }}
    transition={{
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }}
    className="w-full"
  >
    {children}
  </motion.div>
)

// Enhanced Auth initializer component
const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize tokens from localStorage with error handling
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      if (token) {
        // Validate token format before dispatching
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          dispatch(verifyToken());
        } else {
          // Clear invalid token
          localStorage.removeItem('adminToken');
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear potentially corrupted tokens
      localStorage.removeItem('adminToken');
      localStorage.removeItem('authToken');
    }
  }, [dispatch]);

  return null;
};

// App content with enhanced location handling for AnimatePresence
const AppContent = () => {
  const location = useLocation();

  return (
    <>
      <AuthInitializer />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={
              <PageTransition pageKey="home">
                <Home />
              </PageTransition>
            } />
            <Route path="about" element={
              <PageTransition pageKey="about">
                <About />
              </PageTransition>
            } />
            <Route path="services" element={
              <PageTransition pageKey="services">
                <Services />
              </PageTransition>
            } />
            <Route path="services/:slug" element={
              <PageTransition pageKey="service-detail">
                <ServiceDetail />
              </PageTransition>
            } />
            <Route path="projects" element={
              <PageTransition pageKey="projects">
                <Projects />
              </PageTransition>
            } />
            <Route path="projects/:id" element={
              <PageTransition pageKey="project-detail">
                <ProjectDetail />
              </PageTransition>
            } />
            <Route path="team" element={
              <PageTransition pageKey="team">
                <Team />
              </PageTransition>
            } />
            <Route path="team/:id" element={
              <PageTransition pageKey="team-member">
                <TeamMember />
              </PageTransition>
            } />
            <Route path="blog" element={
              <PageTransition pageKey="blog">
                <Blog />
              </PageTransition>
            } />
            <Route path="blog/:slug" element={
              <PageTransition pageKey="blog-post">
                <BlogPost />
              </PageTransition>
            } />
            <Route path="contact" element={
              <PageTransition pageKey="contact">
                <Contact />
              </PageTransition>
            } />
            <Route path="test/api" element={
              <PageTransition pageKey="api-test">
                <APITest />
              </PageTransition>
            } />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={
            <AuthGuard requireAuth={false}>
              <PageTransition pageKey="admin-login">
                <Login />
              </PageTransition>
            </AuthGuard>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <AuthGuard requireAuth={true}>
              <AdminLayout />
            </AuthGuard>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={
              <PageTransition pageKey="admin-dashboard">
                <AdminDashboard />
              </PageTransition>
            } />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <PageTransition pageKey="404">
              <NotFound />
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>

      {/* UI Components */}
      <Toast />
      <ScrollToTop />

      {/* Enhanced background decorations with theme colors */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ backgroundColor: '#8B9471' }}
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            rotate: [0, -3, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          style={{ backgroundColor: '#F5B5A6' }}
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          style={{ backgroundColor: '#6B7280' }}
        />
      </div>

      {/* Noise texture overlay for added sophistication */}
      <div
        className="fixed inset-0 -z-5 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }}
      />
    </>
  );
};

// Enhanced App component with error boundary
function App() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1200))
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Application
          </button>
        </div>
      </div>
    )
  }

  // Loading state with enhanced loader
  if (loading) return <PageLoader />

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles />
          <HelmetProvider>
            <Router>
              <AppContent />
            </Router>
          </HelmetProvider>
        </ThemeProvider>

        {/* React Query Devtools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        )}
      </QueryClientProvider>
    </Provider>
  )
}

export default App
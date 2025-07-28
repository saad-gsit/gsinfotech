// Fixed client/src/App.jsx - All errors resolved
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
import Projects from './pages/Projects'
import Team from './pages/Team'
import Blog from './pages/Blog'
import Contact from './pages/Contact'

// Admin Pages
import Login from './pages/admin/Login'
import AdminDashboard from './pages/admin/AdminDashboard'

// Import your actual admin components
import ProjectsManager from './components/Admin/ProjectsManager'
import BlogManager from './components/Admin/BlogManager'
import ContactsManager from './components/Admin/ContactsManager'
import TeamManager from './components/Admin/TeamManager'

// Auth Guard
import AuthGuard from './components/Admin/AuthGuard'

// Test
import APITest from './components/Test/APITest'

// Enhanced fallback component with animations
const FallbackPage = ({ title, description = "We're working on something amazing. Check back soon!" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen flex items-center justify-center px-4"
  >
    <div className="text-center max-w-2xl">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mx-auto mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 transform rotate-45 translate-x-12 transition-transform group-hover:translate-x-[-100%]"></div>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">{description}</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Go Home
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
)

// Fallback imports for missing pages
const ProjectDetail = () => <FallbackPage title="Project Details" description="Dive deep into our project case studies." />
const BlogPost = () => <FallbackPage title="Blog Post" />
const NotFound = () => <FallbackPage title="404" description="Oops! The page you're looking for doesn't exist." />

// Admin pages with AuthGuard
const AdminProjects = () => (
  <AuthGuard permissions={{ resource: 'projects', action: 'read' }}>
    <ProjectsManager />
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

const AdminAnalytics = () => <FallbackPage title="Admin Analytics" description="View analytics dashboard here." />
const AdminSettings = () => <FallbackPage title="Admin Settings" description="Manage settings here." />

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Enhanced theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#2d2d2d',
      dark: '#000000',
    },
    secondary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    background: {
      default: '#ffffff',
      paper: '#fafafa',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.7,
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
})

// Fixed Global Styles using Emotion
const GlobalStyles = () => (
  <Global
    styles={css`
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%);
      }

      /* Selection color */
      ::selection {
        background: rgba(102, 126, 234, 0.3);
        color: #000;
      }

      /* Smooth scroll */
      html {
        scroll-behavior: smooth;
      }

      /* Gradient text */
      .gradient-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* Animations */
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }

      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
    `}
  />
)

// Page transition wrapper with unique keys
const PageTransition = ({ children, pageKey }) => (
  <motion.div
    key={pageKey}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

// Auth initializer component
const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize tokens from localStorage
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    if (token) {
      // Token will be set in the interceptors
      dispatch(verifyToken());
    }
  }, [dispatch]);

  return null;
};

// App content with location for AnimatePresence
const AppContent = () => {
  const location = useLocation();

  return (
    <>
      <AuthInitializer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<PageTransition pageKey="home"><Home /></PageTransition>} />
            <Route path="about" element={<PageTransition pageKey="about"><About /></PageTransition>} />
            <Route path="projects" element={<PageTransition pageKey="projects"><Projects /></PageTransition>} />
            <Route path="projects/:id" element={<PageTransition pageKey="project-detail"><ProjectDetail /></PageTransition>} />
            <Route path="team" element={<PageTransition pageKey="team"><Team /></PageTransition>} />
            <Route path="blog" element={<PageTransition pageKey="blog"><Blog /></PageTransition>} />
            <Route path="blog/:slug" element={<PageTransition pageKey="blog-post"><BlogPost /></PageTransition>} />
            <Route path="contact" element={<PageTransition pageKey="contact"><Contact /></PageTransition>} />
            <Route path="test/api" element={<PageTransition pageKey="api-test"><APITest /></PageTransition>} />
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
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<PageTransition pageKey="404"><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>

      {/* UI Components */}
      <Toast />
      <ScrollToTop />

      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </>
  );
};

function App() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setTimeout(() => setLoading(false), 1500)
  }, [])

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

        {/* React Query Devtools */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </Provider>
  )
}

export default App
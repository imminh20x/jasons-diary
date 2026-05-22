import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';

const BlogHome = lazy(() => import('./pages/BlogHome').then((m) => ({ default: m.BlogHome })));
const BlogPost = lazy(() => import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
const AdminEditor = lazy(() => import('./pages/AdminEditor').then((m) => ({ default: m.AdminEditor })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RouteFallback() {
  return <div className="route-loading" aria-hidden="true" />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        <div style={{ flex: 1 }}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<BlogHome />} />
              <Route path="/post/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/new" element={<AdminEditor />} />
              <Route path="/admin/edit/:id" element={<AdminEditor />} />
            </Routes>
          </Suspense>
        </div>

        <Footer />
        <BackToTop />
      </div>
    </BrowserRouter>
  );
}

export default App;

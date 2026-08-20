import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Languages, 
  Plus, 
  LayoutDashboard, 
  Ticket, 
  Users,
  LogOut,
  User
} from 'lucide-react';
import Home from './pages/Home';
import axios from 'axios';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';

function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Set global axios interceptor for auth
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const updateEmail = () => {
      setUserEmail(localStorage.getItem('userEmail'));
    };
    
    updateEmail();
    
    window.addEventListener('authChange', updateEmail);
    return () => window.removeEventListener('authChange', updateEmail);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    delete axios.defaults.headers.common['Authorization'];
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Tickets', icon: Ticket, path: '/tickets' },
    { name: 'Team', icon: Users, path: '/team' },
  ];

  const getPageHeaderInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: t('Dashboard'), subtitle: t('High-level overview of your support metrics.') };
    if (path === '/tickets' || path === '/') return { title: t('Ticket Overview'), subtitle: t('Manage and track customer support requests.') };
    if (path === '/team') return { title: t('Team Directory'), subtitle: t('Manage and view your support team members.') };
    if (path === '/create') return { title: t('Create New Ticket'), subtitle: t('Open a new support request.') };
    if (path.startsWith('/ticket/')) return { title: t('Ticket Details'), subtitle: t('View and update ticket status.') };
    return { title: '', subtitle: '' };
  };

  const headerInfo = getPageHeaderInfo();

  // If on login page, don't show the dashboard shell
  if (location.pathname === '/login') {
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-bg-secondary border-r border-border-subtle h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <Ticket className="w-5 h-5 text-bg-primary" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">SupportDesk</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path === '/tickets' && (location.pathname === '/' || location.pathname.startsWith('/ticket/')));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-status-info-bg text-brand-secondary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-secondary' : 'text-text-muted'}`} />
                {t(item.name)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-border-subtle flex items-center justify-center overflow-hidden shrink-0">
               <User className="w-4 h-4 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {userEmail 
                  ? userEmail.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') 
                  : 'Admin User'}
              </p>
              <p className="text-xs text-text-secondary truncate">{userEmail || 'admin@support.com'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-text-muted hover:text-text-secondary transition-colors p-1"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header for Mobile & Global Actions */}
        <header className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-b border-border-subtle px-4 sm:px-8 py-4 flex justify-between items-center min-h-[72px]">
          <div className="flex items-center md:hidden">
            <Ticket className="w-6 h-6 text-brand-secondary mr-2" />
          </div>
          
          <div className="hidden md:block flex-1">
            <h1 className="text-xl font-bold text-text-primary tracking-tight">{headerInfo.title}</h1>
            <p className="text-xs text-text-secondary mt-0.5">{headerInfo.subtitle}</p>
          </div>
          
          <div className="flex items-center md:hidden flex-1">
             <h1 className="text-lg font-semibold text-text-primary truncate">{headerInfo.title}</h1>
          </div>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            {location.pathname !== '/create' && (
              <Link
                to="/create"
                className="flat-button inline-flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('New Ticket')}</span>
              </Link>
            )}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors focus:outline-none"
              aria-label={t('Toggle Language')}
              title={t('Toggle Language')}
            >
              <Languages className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 w-full max-w-7xl mx-auto pb-24 md:pb-8">
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tickets" element={<Home />} />
              <Route path="/team" element={<Team />} />
              <Route path="/create" element={<CreateTicket />} />
              <Route path="/ticket/:id" element={<TicketDetail />} />
            </Route>
          </Routes>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur-md border-t border-border-subtle z-50 pb-safe">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                               (item.path === '/tickets' && (location.pathname === '/' || location.pathname.startsWith('/ticket/')));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[64px] transition-colors ${
                    isActive 
                      ? 'text-brand-secondary' 
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-status-info-bg' : 'bg-transparent'}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-secondary' : 'text-text-muted'}`} />
                  </div>
                  <span className="text-[10px] font-medium">{t(item.name)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;

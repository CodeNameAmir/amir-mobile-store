import React from 'react';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { StoreProvider, useStore } from './context/StoreContext';
import { AboutPage } from './pages/AboutPage';
import { AccountPage } from './pages/AccountPage';
import { CartCheckoutPage } from './pages/CartCheckoutPage';
import { CatalogPage } from './pages/CatalogPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { NotFoundPage, ServerStatusPage } from './pages/StatusPages';
import { TermsPage } from './pages/TermsPage';

const ToastStack: React.FC = () => {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] no-print"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between gap-3 text-xs font-bold border ${
            toast.tone === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : toast.tone === 'info'
              ? 'bg-[#213145] text-white border-[#334155]'
              : 'bg-[#0b1c30] text-white border-[#2563eb]'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.tone === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toast.tone === 'info' ? (
              <Info className="w-4 h-4 text-[#93c5fd] shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="leading-5">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="بستن اعلان"
            className="text-white/70 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const StoreShell: React.FC = () => {
  const { route } = useStore();

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'catalog':
        return <CatalogPage />;
      case 'product':
        return <ProductDetailPage slug={route.slug} />;
      case 'cart':
        return <CartCheckoutPage mode="cart" />;
      case 'checkout':
        return <CartCheckoutPage mode="checkout" />;
      case 'order-confirmed':
        return <OrderConfirmationPage orderCode={route.code} />;
      case 'tracking':
        return <OrderTrackingPage initialCode={route.code} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'terms':
        return <TermsPage />;
      case 'account':
        return <AccountPage />;
      case 'status':
        return <ServerStatusPage />;
      case 'not-found':
      default:
        return <NotFoundPage missingPath={route.page === 'not-found' ? route.path : '/'} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <ToastStack />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreShell />
    </StoreProvider>
  );
}

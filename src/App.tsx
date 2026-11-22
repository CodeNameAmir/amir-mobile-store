import React from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Info, RotateCcw, X } from 'lucide-react';
import { BackToTopButton } from './components/BackToTopButton';
import { CompareTray } from './components/CompareTray';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { RouteTransitionBar } from './components/RouteTransitionBar';
import { TempCommitBanner } from './components/TempCommitBanner';
import { StoreProvider, useStore } from './context/StoreContext';
import { UI_EASE } from './utils/motionHelpers';
import { AboutPage } from './pages/AboutPage';
import { AccountPage } from './pages/AccountPage';
import { CartCheckoutPage } from './pages/CartCheckoutPage';
import { CatalogPage } from './pages/CatalogPage';
import { ComparePage } from './pages/ComparePage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { NotFoundPage, ServerStatusPage } from './pages/StatusPages';
import { TermsPage } from './pages/TermsPage';

interface ErrorBoundaryState {
  hasError: boolean;
}

class StoreErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[StoreErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-[#F7F8FA] text-[#11161E] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#E4E8EE] p-8 text-center space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#FEF3F2] text-[#B42318] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h1 className="text-lg font-semibold text-[#11161E]">
              خطایی در نمایش صفحه رخ داد
            </h1>
            <p className="text-sm text-[#4A5464] leading-7">
              ممکن است داده‌های ذخیره‌شده مرورگر قدیمی شده باشد. با بازنشانی صفحه می‌توانید دوباره وارد فروشگاه شوید.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.removeItem('amir_mobile_cart_v1');
                    window.localStorage.removeItem('amir_mobile_user_v1');
                  } catch {
                    // Ignore storage errors
                  }
                  window.location.assign('/');
                }}
                className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                <span>بارگذاری مجدد فروشگاه</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ToastStack: React.FC = () => {
  const { toasts, dismissToast, buildHref, handleLinkClick } = useStore();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 md:bottom-auto md:top-20 left-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] no-print pointer-events-none"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.slice(-2).map((toast) => (
          <motion.div
            key={toast.id}
            layout
            role="status"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.94 }}
            transition={{ duration: 0.22, ease: UI_EASE }}
            className={`pointer-events-auto relative overflow-hidden rounded-xl px-4 py-3 shadow-lg flex items-center justify-between gap-3 text-xs font-medium border ${
              toast.tone === 'error'
                ? 'bg-[#B42318] text-white border-[#912018]'
                : toast.tone === 'info'
                ? 'bg-[#1E2530] text-white border-[#2E3746]'
                : 'bg-[#13171F] text-white border-[#252C38]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.image ? (
                <div className="w-8 h-8 rounded-lg bg-white overflow-hidden shrink-0 border border-white/15">
                  <img
                    src={toast.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : toast.tone === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-[#FDA29B] shrink-0" strokeWidth={1.5} />
              ) : toast.tone === 'info' ? (
                <Info className="w-4 h-4 text-[#93B4F5] shrink-0" strokeWidth={1.5} />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#6CE9A6] shrink-0" strokeWidth={1.5} />
              )}
              <div className="min-w-0 flex flex-col gap-1">
                <span className="leading-5">{toast.message}</span>
                {toast.actionHref && toast.actionLabel && (
                  <a
                    href={buildHref(toast.actionHref)}
                    onClick={(e) =>
                      handleLinkClick(e, toast.actionHref!, () => dismissToast(toast.id))
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#93B4F5] hover:text-white transition-colors self-start"
                  >
                    <span>{toast.actionLabel}</span>
                    <ArrowLeft className="w-3 h-3" strokeWidth={1.75} />
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="بستن اعلان"
              className="text-white/70 hover:text-white transition-colors shrink-0"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4.1, ease: 'linear' }}
              style={{ transformOrigin: 'right center' }}
              className={`absolute bottom-0 left-0 right-0 h-[2px] ${
                toast.tone === 'error'
                  ? 'bg-[#FDA29B]/70'
                  : toast.tone === 'info'
                  ? 'bg-[#93B4F5]/70'
                  : 'bg-[#6CE9A6]/75'
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const StoreShell: React.FC = () => {
  const { route, compareIds } = useStore();
  const showCompareSpacer = compareIds.length > 0 && route.page !== 'compare';

  const pageKey = (() => {
    switch (route.page) {
      case 'product':
        return `product:${route.slug}`;
      case 'public-profile':
        return `profile:${route.username}`;
      case 'order-confirmed':
        return `order-confirmed:${route.code}`;
      case 'tracking':
        return `tracking:${route.code ?? ''}`;
      default:
        return route.page;
    }
  })();

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'catalog':
        return <CatalogPage />;
      case 'product':
        return <ProductDetailPage slug={route.slug} />;
      case 'compare':
        return <ComparePage />;
      case 'installments':
        return <InstallmentsPage />;
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
      case 'public-profile':
        return <PublicProfilePage username={route.username} />;
      case 'status':
        return <ServerStatusPage />;
      case 'not-found':
      default:
        return <NotFoundPage missingPath={route.page === 'not-found' ? route.path : '/'} />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F7F8FA] text-[#11161E] ${
        showCompareSpacer ? 'pb-20' : ''
      }`}
    >
      <RouteTransitionBar />
      <Navbar />
      <TempCommitBanner />
      <main className="flex-1">
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: UI_EASE }}
        >
          {renderPage()}
        </motion.div>
      </main>
      <Footer />
      <CompareTray />
      <BackToTopButton />
      <ToastStack />
    </div>
  );
};

export default function App() {
  return (
    <StoreErrorBoundary>
      <MotionConfig reducedMotion="user">
        <StoreProvider>
          <StoreShell />
        </StoreProvider>
      </MotionConfig>
    </StoreErrorBoundary>
  );
}

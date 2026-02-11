import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion"; // استخدام مكتبة التحريك للودر

// --- Components & Contexts ---
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { QuranProvider } from "./contexts/QuranContext";
import { MainLayout } from "./components/layout/MainLayout";

// --- Lazy Load Pages (Code Splitting) ---
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DetailView = lazy(() => import("./pages/DetailView"));
const SurahProfile = lazy(() => import("./pages/SurahProfile"));
const RootLengthExplorer = lazy(() => import("./pages/RootLengthExplorer"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RootNetworkExplorer = lazy(() => import("./pages/RootNetworkExplorer"));
const Mushaf = lazy(() => import("./pages/Mushaf"));
const Settings = lazy(() => import("./pages/Settings"));

// --- New Islamic Loader Component ---
// لودر مخصص يتناسب مع الهوية البصرية (ذهبي وتركوازي)
const IslamicLoader = () => (
  <div className="flex flex-col h-[70vh] w-full items-center justify-center gap-6">
    <div className="relative">
      {/* الحلقة الخارجية (التركواز) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 rounded-full border-[3px] border-primary/10 border-t-primary shadow-lg shadow-primary/5"
      />

      {/* الحلقة الداخلية (الذهبي) - تدور بالعكس */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 m-auto w-12 h-12 rounded-full border-[3px] border-secondary/10 border-b-secondary"
      />

      {/* نقطة المركز */}
      <div className="absolute inset-0 m-auto w-3 h-3 bg-primary/20 rounded-full blur-[1px]" />
    </div>

    {/* نص التحميل بخط المصحف */}
    <motion.p
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      className="font-quran text-xl text-primary tracking-wide"
    >
      جاري التحميل...
    </motion.p>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<IslamicLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/network" component={RootNetworkExplorer} />
        {/* تفاصيل الجذر: الجذر / النوع / القيمة */}
        <Route path="/details/:root/:type/:value" component={DetailView} />
        {/* صفحة السورة */}
        <Route path="/surah/:id" component={SurahProfile} />
        {/* استكشاف حسب الطول */}
        <Route path="/morphology/:length" component={RootLengthExplorer} />
        <Route path="/settings" component={Settings} />
        <Route path="/mushaf" component={Mushaf} />

        {/* صفحات الخطأ */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
        {/* صفحة الشبكة التفاعلية */}
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <QuranProvider>
          <TooltipProvider>
            <Toaster position="top-center" dir="rtl" />
            <MainLayout>
              <Router />
            </MainLayout>
            <Analytics />
          </TooltipProvider>
        </QuranProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
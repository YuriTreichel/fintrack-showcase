import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "../css/app.css";

// Lazy-loaded route components (code-splitting)
const App = lazy(() => import("./app.jsx"));
const LandingPage = lazy(() => import("./LandingPage.jsx"));
const LoginView = lazy(() => import("./views/LoginView.jsx"));
const RegisterView = lazy(() => import("./views/RegisterView.jsx"));
const TermsOfUse = lazy(() => import("./views/institutional/Terms.jsx"));
const PrivacyPolicy = lazy(() => import("./views/institutional/Privacy.jsx"));
const BlogPageView = lazy(() => import("./views/public/BlogPageView.jsx"));
const BlogPostView = lazy(() => import("./views/public/BlogPostView.jsx"));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#020617] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#98e5dd] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Showcase Demo: Sempre abre o painel completo do sistema (App) por padrão
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/blog" element={<BlogPageView />} />
          <Route path="/blog/:slug" element={<BlogPostView />} />
          <Route path="/termos" element={<TermsOfUse />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Wait for the next animation frame to ensure document title has been updated by other components
    requestAnimationFrame(() => {
      ReactGA.send({ 
        hitType: "pageview", 
        page: location.pathname + location.search,
        title: document.title
      });
    });
  }, [location]);

  return null; // Este componente não desenha nada no ecrã
}
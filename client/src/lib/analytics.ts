/**
 * Google Analytics 4 initializer
 *
 * Injects the gtag script at runtime only when VITE_GA_MEASUREMENT_ID is set.
 * When the variable is absent (local dev, staging without GA) the function is
 * a no-op and no console errors occur.
 */
export function initAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  if (!measurementId) return;

  // Inject the async gtag loader
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Bootstrap dataLayer and configure the property
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag("js", new Date());
  gtag("config", measurementId);

  // Expose gtag globally so future event calls work
  (window as Window & { gtag?: (...args: unknown[]) => void }).gtag = gtag;
}

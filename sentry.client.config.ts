import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "production",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  initialScope: {
    tags: {
      service: "web",
      platform: "nextjs",
    },
  },

  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],

  beforeSend(event) {
    if (event.request) {
      if (event.request.cookies) {
        event.request.cookies = {};
      }
      if (event.request.headers) {
        const sanitizedHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(event.request.headers)) {
          const lowerKey = key.toLowerCase();
          if (
            lowerKey !== "authorization" &&
            lowerKey !== "cookie" &&
            lowerKey !== "x-auth-token"
          ) {
            sanitizedHeaders[key] = value;
          }
        }
        event.request.headers = sanitizedHeaders;
      }
    }

    if (typeof window !== "undefined") {
      event.tags = {
        ...event.tags,
        route: window.location.pathname,
      };
    }

    return event;
  },

  ignoreErrors: [
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "http://tt.teletrip",
    "chrome-extension://",
    "moz-extension://",
    "Failed to fetch",
    "NetworkError",
    "Load failed",
    "Validation failed",
    "Required field",
  ],

  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    /gtag\/js/i,
    /analytics\.js/i,
    /hotjar\.com/i,
  ],
});

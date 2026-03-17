import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "production",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  initialScope: {
    tags: {
      service: "web",
      platform: "nextjs",
      runtime: "edge",
    },
  },

  tracesSampleRate: 0.1,

  beforeSend(event) {
    if (event.request?.headers) {
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
    return event;
  },
});

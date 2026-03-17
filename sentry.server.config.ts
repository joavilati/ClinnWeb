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

  beforeSend(event) {
    if (event.request) {
      if (event.request.headers) {
        const sanitizedHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(event.request.headers)) {
          const lowerKey = key.toLowerCase();
          if (
            lowerKey !== "authorization" &&
            lowerKey !== "cookie" &&
            lowerKey !== "x-auth-token" &&
            lowerKey !== "x-api-key"
          ) {
            sanitizedHeaders[key] = value;
          }
        }
        event.request.headers = sanitizedHeaders;
      }

      if (event.request.cookies) {
        event.request.cookies = {};
      }

      if (event.request.query_string) {
        const params = new URLSearchParams(event.request.query_string);
        const sensitiveParams = ["token", "key", "password", "secret", "auth"];
        sensitiveParams.forEach((param) => {
          if (params.has(param)) {
            params.set(param, "[REDACTED]");
          }
        });
        event.request.query_string = params.toString();
      }
    }

    return event;
  },

  ignoreErrors: [
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],
});

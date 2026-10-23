import { describe, expect, it } from "vitest";
import { scrubEvent, sentryOptions } from "./sentry";

describe("sentryOptions", () => {
  it("stays disabled when no DSN is configured", () => {
    expect(sentryOptions(undefined).enabled).toBe(false);
  });

  it("reports errors only: no PII, tracing, trace headers or breadcrumbs", () => {
    const options = sentryOptions("https://key@o0.ingest.sentry.io/1");
    expect(options.enabled).toBe(true);
    expect(options.sendDefaultPii).toBe(false);
    expect(options.tracesSampleRate).toBe(undefined);
    expect(options.tracePropagationTargets).toEqual([]);
    expect(options.maxBreadcrumbs).toBe(0);
    expect(options.beforeSendTransaction()).toBe(null);
  });
});

describe("scrubEvent", () => {
  it("drops request data, user, breadcrumbs and extra context", () => {
    const event = scrubEvent({
      message: "boom",
      request: { url: "https://example.com/p?token=secret", headers: { cookie: "a=b" } },
      user: { ip_address: "1.2.3.4" },
      breadcrumbs: [{ message: "clicked" }],
      extra: { body: "secret" },
    });
    expect(event.message).toBe("boom");
    expect(event.request).toBe(undefined);
    expect(event.user).toBe(undefined);
    expect(event.breadcrumbs).toBe(undefined);
    expect(event.extra).toBe(undefined);
  });

  it("drops the request path that captureRequestError adds and strips query strings", () => {
    const event = scrubEvent({
      transaction: "GET /search?q=private&token=secret",
      tags: { url: "https://example.com/search?q=private", route: "/search?q=private" },
      contexts: {
        nextjs: { request_path: "/search?q=private", router_kind: "App Router", route_type: "render" },
        trace: { trace_id: "t" },
        runtime: { name: "node" },
      },
    });
    expect(event.transaction).toBe("GET /search");
    expect(event.tags).toEqual({ route: "/search" });
    expect(event.contexts).toEqual({ runtime: { name: "node" } });
    expect(JSON.stringify(event)).not.toContain("private");
  });

  it("removes local variables from stack frames", () => {
    const event = scrubEvent({
      exception: { values: [{ stacktrace: { frames: [{ function: "f", vars: { password: "p" } }] } }] },
    });
    const frame = event.exception?.values?.[0]?.stacktrace?.frames?.[0] as { function?: string; vars?: unknown };
    expect(frame.function).toBe("f");
    expect(frame.vars).toBe(undefined);
  });
});

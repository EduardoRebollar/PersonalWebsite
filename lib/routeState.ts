/**
 * Tiny shared flag recording whether the current document has performed an
 * in-app (client-side) route change since it loaded.
 *
 * `performance.navigation.type` can't answer this — it describes how the
 * *document* was loaded and keeps reporting "reload" / "navigate" across every
 * subsequent SPA navigation. Components that need to behave differently on a
 * genuine reload/restore vs. an in-app arrival (e.g. ScrollExpandCover, whose
 * scroll-hijack must start collapsed when navigated into but stay expanded when
 * a reader reloads deep in the article) read this instead.
 *
 * `RouteTransition` sets it when it initiates a client navigation. A full
 * document reload re-evaluates this module, resetting it to `false`.
 */
export const routeState = { spaNavigated: false };

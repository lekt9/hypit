import { useEffect, useState } from "react";
import { HelpDialog, LoginGate } from "./components/Dialogs.tsx";
import { Formats } from "./components/Formats.tsx";
import { ProjectDetail } from "./components/ProjectDetail.tsx";
import { Queue } from "./components/Queue.tsx";
import { Review } from "./components/Review.tsx";
import { Shell } from "./components/Shell.tsx";
import { Socials } from "./components/Socials.tsx";
import { studio } from "./store.ts";
import { inReview } from "./types.ts";
import { parseHash, useStudio, type Route } from "./useStudio.ts";

function consumeUrlToken(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;
    localStorage.setItem("surreel.token", token);
    params.delete("token");
    const clean = params.toString();
    const base = window.location.pathname + (clean ? `?${clean}` : "") + window.location.hash;
    window.history.replaceState(null, "", base);
  } catch { /* private mode */ }
}

export function App() {
  const state = useStudio();
  const [route, setRoute] = useState<Route>(() => (typeof window === "undefined" ? { tab: "queue" } : parseHash()));

  useEffect(() => {
    consumeUrlToken();
    void studio.initialize();
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "#/queue";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (route.dialog) return;
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [route.tab, route.projectId, route.dialog]);

  if (state.authRequired && !state.authenticated) {
    return <LoginGate />;
  }

  const inboxCount = state.projects.filter(inReview).length;
  let body = <Queue />;
  if (route.projectId) body = <ProjectDetail id={route.projectId} />;
  else if (route.tab === "review") body = <Review />;
  else if (route.tab === "socials") body = <Socials />;
  else if (route.tab === "formats") body = <Formats />;

  return (
    <Shell
      route={route}
      inboxCount={inboxCount}
      connected={state.connected}
      agentAvailable={state.health.agentAvailable === true}
      authRequired={state.authRequired}
    >
      {body}
      {route.dialog === "help" ? <HelpDialog /> : null}
    </Shell>
  );
}

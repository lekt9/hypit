import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { studio } from "../store.ts";

function closeStudioDialog() {
  window.location.hash = "#/queue";
}

function DialogFrame({
  titleId,
  children,
}: {
  titleId: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const pick = () =>
      Array.from(root.querySelectorAll<HTMLElement>("a[href], button, input, textarea, select")).filter(
        (element) => !element.hasAttribute("disabled"),
      );
    pick()[0]?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeStudioDialog();
        return;
      }
      if (event.key !== "Tab" || !root) return;
      const items = pick();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  return (
    <div className="dialog-scrim" role="presentation" onClick={(event) => event.target === event.currentTarget && closeStudioDialog()}>
      <div ref={ref} className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {children}
      </div>
    </div>
  );
}

export function LoginGate() {
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = token.trim();
    if (clean.length === 0) {
      setError("Enter your studio key.");
      return;
    }
    setChecking(true);
    setError("");
    try {
      const response = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${clean}`, Accept: "application/json" },
      });
      if (response.status === 401) {
        setError("That key is not valid.");
        return;
      }
      if (!response.ok) {
        setError(`Studio returned ${response.status}. Try again.`);
        return;
      }
      studio.setToken(clean);
    } catch {
      setError("Could not reach the studio. Check your connection.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="canvas">
      <div className="bloom" aria-hidden />
      <div className="grain" aria-hidden />
      <div className="column login-column">
        <div className="login">
          <img src="/brand/surreel.svg" alt="" width={36} height={36} className="login-mark" />
          <h1 className="login-title">Surreel</h1>
          <p className="note">Enter your studio key to start creating.</p>
          {error ? <p className="banner">{error}</p> : null}
          <form onSubmit={onSubmit} noValidate>
            <label className="field" htmlFor="login-token">
              <span>Studio key</span>
              <input
                id="login-token"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={token}
                placeholder="surreel-…"
                aria-invalid={error ? true : undefined}
                onChange={(event) => setToken(event.target.value)}
              />
            </label>
            <button type="submit" className="btn" disabled={checking} aria-busy={checking || undefined}>
              {checking ? "Checking" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function HelpDialog() {
  return (
    <DialogFrame titleId="help-title">
      <h2 id="help-title">Paste a page. Keep a take.</h2>
      <p>Drop a product or site URL. Browser Use opens the live page, follows what explains the offer, and writes a facts-only brief. Swipe the format wheel to rotate the chosen type. Past takes use the same wheel — turn it, tap the front film to fill the screen, then Details if you need the project. Then each angle uses its Surreel packs and Hypit playbook. Motion renders on Seedance 2 Fast only. Captions come from Hypit caption craft on the finished plate, never burned by Seedance and never transcribed from the film. A take that skips those packs is refused. Keep what sells. Send copies the social caption and opens TikTok, Instagram, YouTube, or X. You still post the file there.</p>
      <div className="dialog-actions">
        <a className="btn" href="#/queue">
          Start a queue
        </a>
        <a className="btn btn-ghost" href="#/queue">
          Close
        </a>
      </div>
    </DialogFrame>
  );
}

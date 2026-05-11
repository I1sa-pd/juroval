import { useEffect, useRef, useState } from "react";

type AppComponent = () => JSX.Element;

let CachedApp: AppComponent | null = null;

export function ClientOnlyApp() {
  const [ready, setReady] = useState(!!CachedApp);
  const appRef = useRef<AppComponent | null>(CachedApp);

  useEffect(() => {
    if (CachedApp) return;
    let active = true;
    import("./App").then((m) => {
      if (!active) return;
      CachedApp = m.default as AppComponent;
      appRef.current = CachedApp;
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  if (!ready || !appRef.current) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#0e1730,#1E2E4F,#3a4974)",
          display: "grid",
          placeItems: "center",
          color: "#DED3BC",
          fontFamily: "Lato, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Jurova Legal Group</div>
          <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>Cargando plataforma…</div>
        </div>
      </div>
    );
  }

  const App = appRef.current;
  return <App />;
}

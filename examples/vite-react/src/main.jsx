import { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [count, setCount] = useState(0);
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "64px auto", padding: "0 16px" }}>
      <h1>Vite + React</h1>
      <p>A static site served by SKYHOST with SPA fallback and long-lived caching for assets.</p>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>
      <p>Edit <code>src/main.jsx</code> and push: SKYHOST redeploys automatically.</p>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

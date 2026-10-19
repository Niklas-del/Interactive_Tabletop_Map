import { useState } from "react";

export function SettingsTab() {
  const [compact, setCompact] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  return (
    <section className="panel">
      <h2>Settings</h2>
      <label className="toggle"><input type="checkbox" checked={compact} onChange={() => setCompact((v) => !v)} /> Compact mode</label>
      <label className="toggle"><input type="checkbox" checked={showGrid} onChange={() => setShowGrid((v) => !v)} /> Show helper grid overlays</label>
      <p className="hint">These preferences are local UI toggles for the prototype and can be expanded later.</p>
    </section>
  );
}

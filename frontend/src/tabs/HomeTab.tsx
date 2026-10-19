export function HomeTab() {
  return (
    <section className="panel">
      <h2>Project Atlas Command Board</h2>
      <p>Welcome to the first playable prototype. Use quick actions to jump directly into core systems.</p>
      <div className="card-grid">
        <article className="card"><h3>Create Character</h3><p>Open Characters to forge a new hero.</p></article>
        <article className="card"><h3>Explore Room</h3><p>Use Rooms to load a map and test movement.</p></article>
        <article className="card"><h3>Edit Layout</h3><p>Use Design Studio to place walls and obstacles.</p></article>
      </div>
    </section>
  );
}

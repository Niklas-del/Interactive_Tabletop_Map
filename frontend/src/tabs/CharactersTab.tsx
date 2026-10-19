import { useMemo, useState } from "react";
import { api } from "../api";
import type { Character, CharacterInput } from "../types";

type Props = {
  characters: Character[];
  refresh: () => Promise<void>;
  selectedCharacterId: number | null;
  onSelectCharacter: (id: number) => void;
};

const defaultForm: CharacterInput = {
  name: "",
  description: "",
  archetype: "Adventurer",
  appearance: "wanderer",
  level: 1,
  health: 10,
  max_health: 10,
  attributes: { strength: 5, agility: 5, intelligence: 5 },
  equipment: { weapon: "Dagger", armor: "Cloak", trinket: "Charm" },
  portrait: null,
};

export function CharactersTab({ characters, refresh, selectedCharacterId, onSelectCharacter }: Props) {
  const [form, setForm] = useState<CharacterInput>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => characters.find((c) => c.id === selectedCharacterId) ?? null, [characters, selectedCharacterId]);

  async function submitCharacter() {
    setError(null);
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (form.health > form.max_health) {
      setError("Health cannot exceed max health.");
      return;
    }

    try {
      if (editingId) await api.updateCharacter(editingId, form);
      else await api.createCharacter(form);
      setForm(defaultForm);
      setEditingId(null);
      await refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save character.");
    }
  }

  function startEdit(character: Character) {
    setEditingId(character.id);
    setForm({
      name: character.name,
      description: character.description,
      archetype: character.archetype,
      appearance: character.appearance,
      level: character.level,
      health: character.health,
      max_health: character.max_health,
      attributes: character.attributes,
      equipment: character.equipment,
      portrait: character.portrait ?? null,
    });
  }

  async function removeCharacter(character: Character) {
    if (!window.confirm(`Delete ${character.name}? This cannot be undone.`)) return;
    await api.deleteCharacter(character.id);
    if (selectedCharacterId === character.id) onSelectCharacter(0);
    await refresh();
  }

  return (
    <section className="panel split">
      <div>
        <h2>{editingId ? "Edit Character" : "Create Character"}</h2>
        {error ? <p className="error">{error}</p> : null}
        <div className="form-grid">
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Class<input value={form.archetype} onChange={(e) => setForm({ ...form, archetype: e.target.value })} /></label>
          <label>Appearance<input value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} /></label>
          <label>Level<input type="number" min={1} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} /></label>
          <label>Health<input type="number" min={0} value={form.health} onChange={(e) => setForm({ ...form, health: Number(e.target.value) })} /></label>
          <label>Max Health<input type="number" min={1} value={form.max_health} onChange={(e) => setForm({ ...form, max_health: Number(e.target.value) })} /></label>
          <label>Strength<input type="number" min={1} value={form.attributes.strength} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, strength: Number(e.target.value) } })} /></label>
          <label>Agility<input type="number" min={1} value={form.attributes.agility} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, agility: Number(e.target.value) } })} /></label>
          <label>Intelligence<input type="number" min={1} value={form.attributes.intelligence} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, intelligence: Number(e.target.value) } })} /></label>
          <label>Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        </div>
        <div className="actions">
          <button onClick={submitCharacter}>{editingId ? "Save Changes" : "Create Character"}</button>
          {editingId ? <button onClick={() => { setEditingId(null); setForm(defaultForm); }}>Cancel</button> : null}
        </div>
      </div>

      <div>
        <h2>Character Gallery</h2>
        {selected ? <p className="hint">Selected: {selected.name}</p> : <p className="hint">Select a character to use in rooms.</p>}
        <div className="list">
          {characters.map((character) => (
            <article key={character.id} className="list-card">
              <h3>{character.name}</h3>
              <p>{character.archetype} · Lvl {character.level}</p>
              <p>{character.description || "No lore yet."}</p>
              <div className="actions">
                <button onClick={() => onSelectCharacter(character.id)}>Select</button>
                <button onClick={() => startEdit(character)}>Edit</button>
                <button className="danger" onClick={() => removeCharacter(character)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

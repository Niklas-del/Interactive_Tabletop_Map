import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { api } from "./api";
import { CharactersTab } from "./tabs/CharactersTab";
import { DesignStudioTab } from "./tabs/DesignStudioTab";
import { HomeTab } from "./tabs/HomeTab";
import { RoomsTab } from "./tabs/RoomsTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { WorldMapTab } from "./tabs/WorldMapTab";
import type { Character, Room } from "./types";

type TabKey = "home" | "characters" | "world-map" | "rooms" | "design" | "settings";

const tabs: { key: TabKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "characters", label: "Characters" },
  { key: "world-map", label: "World Map" },
  { key: "rooms", label: "Rooms" },
  { key: "design", label: "Design Studio" },
  { key: "settings", label: "Settings" },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshCharacters() {
    try {
      const data = await api.listCharacters();
      setCharacters(data);
      if (data.length > 0 && !selectedCharacterId) setSelectedCharacterId(data[0].id);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not load characters");
    }
  }

  async function refreshRooms() {
    try {
      const data = await api.listRooms();
      setRooms(data);
      if (data.length > 0 && !selectedRoomId) setSelectedRoomId(data[0].id);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not load rooms");
    }
  }

  useEffect(() => {
    void refreshCharacters();
    void refreshRooms();
  }, []);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedCharacterId) ?? null,
    [characters, selectedCharacterId],
  );

  return (
    <div className="app-shell">
      <header className="top-nav">
        <button className="ghost" onClick={() => setSidebarOpen((value) => !value)}>{sidebarOpen ? "⮜" : "⮞"}</button>
        <h1>Project Atlas</h1>
        <span className="subtitle">Online Tabletop RPG Prototype</span>
      </header>

      <div className="content-wrap">
        <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          {tabs.map((tab) => (
            <button key={tab.key} className={activeTab === tab.key ? "active" : ""} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="main-content">
          {error ? <p className="error">{error}</p> : null}
          {activeTab === "home" ? <HomeTab /> : null}
          {activeTab === "characters" ? (
            <CharactersTab
              characters={characters}
              refresh={refreshCharacters}
              selectedCharacterId={selectedCharacterId}
              onSelectCharacter={(id) => setSelectedCharacterId(id || null)}
            />
          ) : null}
          {activeTab === "world-map" ? <WorldMapTab rooms={rooms} onOpenRoom={(id) => { setSelectedRoomId(id); setActiveTab("rooms"); }} /> : null}
          {activeTab === "rooms" ? (
            <RoomsTab
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              selectedCharacter={selectedCharacter}
            />
          ) : null}
          {activeTab === "design" ? <DesignStudioTab rooms={rooms} refreshRooms={refreshRooms} /> : null}
          {activeTab === "settings" ? <SettingsTab /> : null}
        </main>

        <aside className="right-panel">
          <h3>Context</h3>
          <p>Characters: {characters.length}</p>
          <p>Rooms: {rooms.length}</p>
          <p>Active tab: {tabs.find((tab) => tab.key === activeTab)?.label}</p>
        </aside>
      </div>
    </div>
  );
}

export default App;

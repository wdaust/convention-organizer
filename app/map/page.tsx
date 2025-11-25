'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p>Loading Map...</p>,
});

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color?: string;
  category?: string;
  level?: string;
}

const COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink', 'gray'];
const LEVELS = ['Arena Level', 'Concourse', 'Suite Level', 'Upper Level', 'Parking'];

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [filterColor, setFilterColor] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterNumberMin, setFilterNumberMin] = useState<string>('');
  const [filterNumberMax, setFilterNumberMax] = useState<string>('');
  const [editingPin, setEditingPin] = useState<Location | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [levelImages, setLevelImages] = useState<Record<string, string>>({
    'Arena Level': '/arena-floor.png',
    'Concourse': '/arena-floor.png',
    'Suite Level': '/arena-floor.png',
    'Upper Level': '/arena-floor.png',
    'Parking': '/arena-floor.png',
  });

  const loadLevelImages = () => {
    fetch('/api/levels')
      .then((res) => res.json())
      .then((data) => {
        console.log('Loaded level images:', data);
        setLevelImages(data);
      })
      .catch((err) => {
        console.error('Failed to load level images', err);
      });
  };

  const loadLocations = () => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched data:', data);
        if (Array.isArray(data)) {
          console.log('Setting locations:', data.length);
          setLocations(data);
        } else if (data.error) {
          console.warn('Notion not configured:', data.error);
          setLocations([]);
        } else {
          console.error('Invalid data format', data);
          setLocations([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load locations', err);
        setLocations([]);
      });
  };

  useEffect(() => {
    loadLocations();
    loadLevelImages();
  }, []);

  const handleLocationUpdate = async (id: string, lat: number, lng: number) => {
    try {
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, lat, lng }),
      });
      console.log('Location updated');
    } catch (error) {
      console.error('Failed to update location', error);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (!editMode) return;

    const name = prompt('Enter name/number for this location:');
    if (!name) return;

    const color = prompt(`Enter color (${COLORS.join(', ')}):`)?.toLowerCase();
    const level = prompt(`Enter level (${LEVELS.join(', ')}):`) || 'Arena Level';
    const category = prompt('Enter department (e.g., Security, Medical, Concessions):');

    try {
      const response = await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, lat, lng, color, level, category }),
      });

      const result = await response.json();
      if (result.success) {
        loadLocations();
      } else {
        alert('Failed to create location: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create location', error);
    }
  };

  const handlePinClick = (location: Location) => {
    if (editMode) {
      setEditingPin(location);
    }
  };

  const handleEditSave = async () => {
    if (!editingPin) return;

    try {
      await fetch(`/api/locations/${editingPin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingPin.name,
          color: editingPin.color,
          level: editingPin.level,
          category: editingPin.category,
        }),
      });
      setEditingPin(null);
      loadLocations();
    } catch (error) {
      console.error('Failed to update pin', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pin?')) return;

    try {
      await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      loadLocations();
      setEditingPin(null);
    } catch (error) {
      console.error('Failed to delete pin', error);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (filterColor !== 'all' && loc.color !== filterColor) return false;
    if (filterLevel !== 'all' && loc.level !== filterLevel) return false;
    if (filterDepartment !== 'all' && loc.category !== filterDepartment) return false;
    const numMatch = loc.name.match(/\d+/);
    const locNumber = numMatch ? parseInt(numMatch[0]) : null;
    if (filterNumberMin && locNumber && locNumber < parseInt(filterNumberMin)) return false;
    if (filterNumberMax && locNumber && locNumber > parseInt(filterNumberMax)) return false;
    return true;
  });

  // Get unique departments from locations
  const departments = Array.from(new Set(locations.map(loc => loc.category).filter(Boolean)));

  const exportMap = () => {
    alert('Export feature coming soon! Will export as image/PDF.');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-900 text-white overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold mb-4">Arena Map</h1>

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`w-full py-2 px-4 rounded font-bold ${editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {editMode ? '✓ Edit Mode ON' : 'Edit Mode OFF'}
          </button>
        </div>

        {/* Floor Plan Images Info */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold mb-2">Floor Plan Images</h2>
          <p className="text-xs text-gray-400 mb-2">
            Managed in Notion "Levels" database
          </p>
          <button
            onClick={loadLevelImages}
            className="w-full py-1 px-2 text-xs bg-blue-600 hover:bg-blue-700 rounded"
          >
            Refresh Images
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold mb-2">Filters</h2>

          <label className="block mb-2 text-sm">Level</label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-3"
          >
            <option value="all">All Levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <label className="block mb-2 text-sm">Department</label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-3"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <label className="block mb-2 text-sm">Color</label>
          <select
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-3"
          >
            <option value="all">All Colors</option>
            {COLORS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="block mb-2 text-sm">Number Range</label>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              placeholder="Min"
              value={filterNumberMin}
              onChange={(e) => setFilterNumberMin(e.target.value)}
              className="w-1/2 p-2 rounded bg-gray-800 border border-gray-700"
            />
            <input
              type="number"
              placeholder="Max"
              value={filterNumberMax}
              onChange={(e) => setFilterNumberMax(e.target.value)}
              className="w-1/2 p-2 rounded bg-gray-800 border border-gray-700"
            />
          </div>

          <button
            onClick={() => {
              setFilterColor('all');
              setFilterLevel('all');
              setFilterDepartment('all');
              setFilterNumberMin('');
              setFilterNumberMax('');
            }}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Clear Filters
          </button>
        </div>

        {/* Legend / Location List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="font-bold mb-2">Locations ({filteredLocations.length})</h2>
          <div className="space-y-2">
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer"
                onClick={() => handlePinClick(loc)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: loc.color ? `var(--color-${loc.color})` : '#3B82F6' }}
                  >
                    {loc.name.match(/\d+/)?.[0] || loc.name.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{loc.name}</div>
                    <div className="text-xs text-gray-400">
                      {loc.level && <span>{loc.level}</span>}
                      {loc.category && <span> • {loc.category}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={exportMap}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-bold"
          >
            Export Map
          </button>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 z-[1000] bg-gray-900 text-white p-3 rounded shadow-lg hover:bg-gray-800 transition-all ${sidebarOpen ? 'left-[304px]' : 'left-4'
          }`}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          locations={filteredLocations}
          onLocationUpdate={handleLocationUpdate}
          onMapClick={handleMapClick}
          onPinClick={handlePinClick}
          editMode={editMode}
          currentLevel={filterLevel === 'all' ? 'Arena Level' : filterLevel}
          levelImages={levelImages}
        />
      </div>

      {/* Edit Modal */}
      {editingPin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Location</h2>

            <label className="block mb-2 text-sm font-bold">Name/Number</label>
            <input
              type="text"
              value={editingPin.name}
              onChange={(e) => setEditingPin({ ...editingPin, name: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />

            <label className="block mb-2 text-sm font-bold">Color</label>
            <select
              value={editingPin.color || ''}
              onChange={(e) => setEditingPin({ ...editingPin, color: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value="">None</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label className="block mb-2 text-sm font-bold">Level/Department</label>
            <select
              value={editingPin.level || ''}
              onChange={(e) => setEditingPin({ ...editingPin, level: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value="">None</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <label className="block mb-2 text-sm font-bold">Department</label>
            <input
              type="text"
              value={editingPin.category || ''}
              onChange={(e) => setEditingPin({ ...editingPin, category: e.target.value })}
              className="w-full p-2 border rounded mb-4"
              placeholder="e.g., Security, Medical, Concessions"
            />

            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPin(null)}
                className="flex-1 py-2 bg-gray-300 rounded hover:bg-gray-400 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(editingPin.id)}
                className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

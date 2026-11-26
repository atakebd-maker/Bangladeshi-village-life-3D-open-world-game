import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  GameSettings,
  GraphicsQuality,
  TimeOfDayPreset,
  WeatherPreset,
} from '../types/game';

interface SettingsProps {
  settings: GameSettings;
  initialTab?: 'graphics' | 'sound' | 'world';
  onChange: (next: GameSettings) => void;
  onClose: () => void;
}

const GRAPHICS_OPTS: Array<{ id: GraphicsQuality; label: string; desc: string }> = [
  { id: 'low', label: 'Low', desc: 'Fastest mobile frame rate, shadows off' },
  { id: 'medium', label: 'Medium', desc: 'Balanced resolution & soft shadows' },
  { id: 'high', label: 'High', desc: 'Crisp PBR details & wide draw distance' },
  { id: 'ultra', label: 'Ultra', desc: 'Maximum native pixel density & horizon' },
];

const TIME_OPTS: Array<{ id: TimeOfDayPreset; label: string }> = [
  { id: 'sunrise', label: 'Sunrise' },
  { id: 'morning', label: 'Morning' },
  { id: 'noon', label: 'Noon' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'night', label: 'Night' },
];

const WEATHER_OPTS: Array<{ id: WeatherPreset; label: string }> = [
  { id: 'sunny', label: 'Sunny' },
  { id: 'cloudy', label: 'Cloudy' },
  { id: 'rainy', label: 'Rainy' },
  { id: 'heavy_rain', label: 'Heavy Rain' },
  { id: 'thunderstorm', label: 'Thunderstorm' },
  { id: 'fog', label: 'Fog' },
];

export const Settings: React.FC<SettingsProps> = ({
  settings,
  initialTab = 'graphics',
  onChange,
  onClose,
}) => {
  const [tab, setTab] = useState<'graphics' | 'sound' | 'world'>(initialTab);

  const update = (patch: Partial<GameSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold tracking-wide text-white">
              Game Settings
            </h2>
            <span className="text-xs text-slate-400">· TAHSIN STUDIO</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:border-slate-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-slate-800 bg-slate-950/60 px-5 py-2.5">
          {(['graphics', 'sound', 'world'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition whitespace-nowrap ${
                tab === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t === 'world' ? 'Time & Weather' : t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === 'graphics' && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Graphics Quality Preset
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {GRAPHICS_OPTS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => update({ graphics: opt.id })}
                      className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                        settings.graphics === opt.id
                          ? 'border-emerald-500 bg-emerald-950/50 text-white'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className="mt-0.5 text-xs text-slate-400">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Camera Sensitivity</span>
                  <span className="font-mono-num text-amber-400">
                    {settings.cameraSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={2.2}
                  step={0.1}
                  value={settings.cameraSensitivity}
                  onChange={(e) => update({ cameraSensitivity: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {tab === 'sound' && (
            <div className="space-y-4">
              {[
                { key: 'masterVolume' as const, label: 'Master Volume' },
                { key: 'ambientVolume' as const, label: 'Nature & Village Ambience' },
                { key: 'sfxVolume' as const, label: 'Vehicles, Cricket & Actions' },
              ].map((s) => (
                <div key={s.key}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{s.label}</span>
                    <span className="font-mono-num text-emerald-400">
                      {Math.round(settings[s.key] * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings[s.key]}
                    onChange={(e) => update({ [s.key]: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
              ))}
            </div>
          )}

          {tab === 'world' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5">
                <span className="text-sm font-medium text-slate-200">
                  Automatic Day-Night Cycle
                </span>
                <input
                  type="checkbox"
                  checked={settings.autoDayNight}
                  onChange={(e) => update({ autoDayNight: e.target.checked })}
                  className="h-4 w-4 accent-emerald-500"
                />
              </label>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Time of Day
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_OPTS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => update({ timeOfDay: t.id })}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        settings.timeOfDay === t.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-slate-700 bg-slate-800/70 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Weather Condition
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {WEATHER_OPTS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => update({ weather: w.id })}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        settings.weather === w.id
                          ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                          : 'border-slate-700 bg-slate-800/70 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

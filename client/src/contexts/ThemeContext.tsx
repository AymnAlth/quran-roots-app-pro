import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorPreset: string;
  setColorPreset: (presetId: string) => void;
  applyPresetPreview: (presetId: string) => void;
  setCustomPreset: (colors: { primary: string; secondary: string; accent: string }) => void;
  customColors: { light: Record<string, string>; dark: Record<string, string> } | null;
  presets: Record<string, { name: string; light: Record<string, string>; dark: Record<string, string> }>;
}

type PresetType = { name: string; light: Record<string, string>; dark: Record<string, string> };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const presetKey = `${storageKey}-color-preset`;

  const PRESETS: Record<string, PresetType> = {
    default: {
      name: 'Classic Teal',
      light: {
        '--primary': '#0f4c5c',
        '--secondary': '#fb8b24',
        '--accent': '#e2e8f0',
        '--ring': '#0f4c5c'
      },
      dark: {
        '--primary': '#64ffda',
        '--secondary': '#ffd700',
        '--accent': '#1e293b',
        '--ring': '#64ffda'
      }
    },
    ocean: {
      name: 'Ocean Breeze',
      light: {
        '--primary': '#0b7285',
        '--secondary': '#0ea5a6',
        '--accent': '#cffafe',
        '--ring': '#0b7285'
      },
      dark: {
        '--primary': '#2dd4bf',
        '--secondary': '#06b6d4',
        '--accent': '#134e4a',
        '--ring': '#2dd4bf'
      }
    },
    sunset: {
      name: 'Golden Sunset',
      light: {
        '--primary': '#b45309',
        '--secondary': '#fb923c',
        '--accent': '#fef3c7',
        '--ring': '#b45309'
      },
      dark: {
        '--primary': '#fb923c',
        '--secondary': '#f97316',
        '--accent': '#7c2d12',
        '--ring': '#fb923c'
      }
    },
    emerald: {
      name: 'Emerald Grove',
      light: {
        '--primary': '#047857',
        '--secondary': '#10b981',
        '--accent': '#d1fae5',
        '--ring': '#047857'
      },
      dark: {
        '--primary': '#34d399',
        '--secondary': '#10b981',
        '--accent': '#064e3b',
        '--ring': '#34d399'
      }
    },
    royal: {
      name: 'Royal Indigo',
      light: {
        '--primary': '#3730a3',
        '--secondary': '#7c3aed',
        '--accent': '#eef2ff',
        '--ring': '#3730a3'
      },
      dark: {
        '--primary': '#a78bfa',
        '--secondary': '#7c3aed',
        '--accent': '#1e1b4b',
        '--ring': '#a78bfa'
      }
    },
    lavender: {
      name: 'Lavender Mist',
      light: {
        '--primary': '#6d28d9',
        '--secondary': '#c084fc',
        '--accent': '#f3e8ff',
        '--ring': '#6d28d9'
      },
      dark: {
        '--primary': '#c4b5fd',
        '--secondary': '#a78bfa',
        '--accent': '#2a1450',
        '--ring': '#c4b5fd'
      }
    },
    coral: {
      name: 'Coral Blush',
      light: {
        '--primary': '#fb6b6b',
        '--secondary': '#ffb4a2',
        '--accent': '#fff1f0',
        '--ring': '#fb6b6b'
      },
      dark: {
        '--primary': '#ff7b88',
        '--secondary': '#ff9aa2',
        '--accent': '#3b0a0a',
        '--ring': '#ff7b88'
      }
    },
    slate: {
      name: 'Slate Calm',
      light: {
        '--primary': '#334155',
        '--secondary': '#475569',
        '--accent': '#f8fafc',
        '--ring': '#334155'
      },
      dark: {
        '--primary': '#94a3b8',
        '--secondary': '#64748b',
        '--accent': '#0b1220',
        '--ring': '#94a3b8'
      }
    },
    mint: {
      name: 'Mint Fresh',
      light: {
        '--primary': '#10b981',
        '--secondary': '#06b6d4',
        '--accent': '#ecfeff',
        '--ring': '#10b981'
      },
      dark: {
        '--primary': '#34d399',
        '--secondary': '#2dd4bf',
        '--accent': '#052e2e',
        '--ring': '#34d399'
      }
    },
    berry: {
      name: 'Berry Punch',
      light: {
        '--primary': '#db2777',
        '--secondary': '#f472b6',
        '--accent': '#fff1f2',
        '--ring': '#db2777'
      },
      dark: {
        '--primary': '#f9a8d4',
        '--secondary': '#f472b6',
        '--accent': '#2b0b12',
        '--ring': '#f9a8d4'
      }
    },
    dusk: {
      name: 'Dusk Blue',
      light: {
        '--primary': '#1e293b',
        '--secondary': '#334155',
        '--accent': '#e6eef6',
        '--ring': '#1e293b'
      },
      dark: {
        '--primary': '#60a5fa',
        '--secondary': '#7dd3fc',
        '--accent': '#071427',
        '--ring': '#60a5fa'
      }
    }
  };

  const customKey = `${storageKey}-custom-colors`;

  const [customColors, setCustomColors] = useState<{ light: Record<string, string>; dark: Record<string, string> } | null>(
    () => {
      try {
        const raw = localStorage.getItem(customKey);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }
  );

  const mergedPresets: Record<string, PresetType> = React.useMemo(() => {
    if (!customColors) return PRESETS;
    return {
      ...PRESETS,
      custom: {
        name: 'Custom Palette',
        light: customColors.light,
        dark: customColors.dark,
      },
    };
  }, [customColors]);

  const [colorPreset, setColorPresetState] = useState<string>(
    () => localStorage.getItem(presetKey) || 'default'
  );

  const applyPreset = (presetId: string, resolvedTheme: Theme | 'light' | 'dark') => {
    const preset: PresetType = mergedPresets[presetId] || mergedPresets['default'];
    const vars: Record<string, string> = resolvedTheme === 'dark' ? preset.dark : preset.light;
    const root = window.document.documentElement;

    Object.entries(vars).forEach(([k, v]) => {
      root.style.setProperty(k, String(v));
    });
  };

  // Apply without mutating saved preset state — used for preview/temporary application
  const applyPresetPreview = (presetId: string) => {
    const resolved = theme === 'system'
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light')
      : theme;
    applyPreset(presetId, resolved);
  };

  const setCustomPreset = (colors: { primary: string; secondary: string; accent: string }) => {
    // build light/dark variants (simple approach: use same colors; could be enhanced)
    const light = {
      '--primary': colors.primary,
      '--secondary': colors.secondary,
      '--accent': colors.accent,
      '--ring': colors.primary,
    };
    const dark = {
      '--primary': colors.primary,
      '--secondary': colors.secondary,
      '--accent': colors.accent,
      '--ring': colors.primary,
    };

    const payload = { light, dark };
    try {
      localStorage.setItem(customKey, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
    setCustomColors(payload);
    // select custom preset and apply
    setColorPresetState('custom');
    const resolved = theme === 'system'
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light')
      : theme;
    applyPreset('custom', resolved);
  };

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      // apply current color preset for system-resolved theme
      applyPreset(colorPreset, systemTheme);
      return;
    }

    root.classList.add(theme);
    applyPreset(colorPreset, theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    colorPreset,
    setColorPreset: (presetId: string) => {
      localStorage.setItem(presetKey, presetId);
      setColorPresetState(presetId);
      // apply immediately using current theme resolution
      const resolved = theme === 'system'
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light')
        : theme;
      applyPreset(presetId, resolved);
    },
    applyPresetPreview,
    setCustomPreset,
    customColors,
    presets: mergedPresets as any
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}


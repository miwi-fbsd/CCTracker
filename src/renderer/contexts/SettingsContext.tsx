import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppSettings } from '@shared/types';
import { log } from '@shared/utils/logger';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
  initialSettings: AppSettings;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    setIsLoading(true);
    try {
      const newSettings = { ...settings, ...updates };
      await window.electronAPI.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      log.error('Failed to update settings', error as Error, 'SettingsContext');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};
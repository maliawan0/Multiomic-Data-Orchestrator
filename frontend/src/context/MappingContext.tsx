import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Mapping } from './NewRunContext';

export interface TemplateMapping {
  templateId: string;
  mapping: Mapping;
}

export interface SavedMappingConfiguration {
  id: string;
  name: string;
  createdAt: string;
  templateMappings: TemplateMapping[];
}

interface MappingContextType {
  savedMappings: SavedMappingConfiguration[];
  saveMapping: (name: string, templateMappings: TemplateMapping[]) => void;
  deleteMapping: (id: string) => void;
}

const MappingContext = createContext<MappingContextType | undefined>(undefined);

export const MappingProvider = ({ children }: { children: ReactNode }) => {
  const [savedMappings, setSavedMappings] = useState<SavedMappingConfiguration[]>([]);

  useEffect(() => {
    try {
      const storedMappings = localStorage.getItem('mdo-mappings');
      if (storedMappings) {
        setSavedMappings(JSON.parse(storedMappings));
      }
    } catch (error) {
      console.error("Failed to parse mappings from localStorage", error);
      localStorage.removeItem('mdo-mappings');
    }
  }, []);

  const updateLocalStorage = (mappings: SavedMappingConfiguration[]) => {
    localStorage.setItem('mdo-mappings', JSON.stringify(mappings));
  };

  const saveMapping = (name: string, templateMappings: TemplateMapping[]) => {
    const newMapping: SavedMappingConfiguration = {
      id: `map-${new Date().getTime()}`,
      name,
      createdAt: new Date().toISOString(),
      templateMappings,
    };
    setSavedMappings(prev => {
      const updated = [...prev, newMapping];
      updateLocalStorage(updated);
      return updated;
    });
  };

  const deleteMapping = (id: string) => {
    setSavedMappings(prev => {
      const updated = prev.filter(m => m.id !== id);
      updateLocalStorage(updated);
      return updated;
    });
  };

  return (
    <MappingContext.Provider value={{ savedMappings, saveMapping, deleteMapping }}>
      {children}
    </MappingContext.Provider>
  );
};

export const useMappings = () => {
  const context = useContext(MappingContext);
  if (context === undefined) {
    throw new Error('useMappings must be used within a MappingProvider');
  }
  return context;
};
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Mapping } from './NewRunContext';
import { getMappings, saveMapping as apiSaveMapping, deleteMapping as apiDeleteMapping } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface TemplateMapping {
  templateId: string;
  mapping: Mapping;
}

export interface SavedMappingConfiguration {
  id: string;
  name: string;
  createdAt: string;
  mappings: TemplateMapping[];
}

interface MappingContextType {
  savedMappings: SavedMappingConfiguration[];
  saveMapping: (name: string, templateMappings: TemplateMapping[]) => Promise<void>;
  deleteMapping: (id: string) => Promise<void>;
  isLoading: boolean;
}

const MappingContext = createContext<MappingContextType | undefined>(undefined);

export const MappingProvider = ({ children }: { children: ReactNode }) => {
  const [savedMappings, setSavedMappings] = useState<SavedMappingConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMappings = async () => {
      if (user) {
        try {
          const mappings = await getMappings();
          // Transform the response to match our interface
          const transformedMappings: SavedMappingConfiguration[] = mappings.map((m: any) => ({
            id: m.id || m._id,
            name: m.name,
            createdAt: m.createdAt || m.created_at || new Date().toISOString(),
            mappings: m.mappings || []
          }));
          setSavedMappings(transformedMappings);
        } catch (error) {
          console.error("Failed to fetch mappings", error);
          setSavedMappings([]);
        }
      } else {
        setSavedMappings([]);
      }
      setIsLoading(false);
    };

    fetchMappings();
  }, [user]);

  const saveMapping = async (name: string, templateMappings: TemplateMapping[]) => {
    const response = await apiSaveMapping({ name, mappings: templateMappings });
    
    // Transform the response to match our interface
    const newMapping: SavedMappingConfiguration = {
      id: response.id || response._id,
      name: response.name,
      createdAt: response.createdAt || response.created_at || new Date().toISOString(),
      mappings: response.mappings || templateMappings
    };
    
    setSavedMappings(prev => [...prev, newMapping]);
  };

  const deleteMapping = async (id: string) => {
    await apiDeleteMapping(id);
    setSavedMappings(prev => prev.filter(m => m.id !== id));
  };

  return (
    <MappingContext.Provider value={{ savedMappings, saveMapping, deleteMapping, isLoading }}>
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

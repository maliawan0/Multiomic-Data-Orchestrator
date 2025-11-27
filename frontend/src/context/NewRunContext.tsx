import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Mapping {
  [canonicalField: string]: string; // maps canonical field to csv column
}

interface FileMapping {
  file: File;
  templateId?: string;
  columns: string[];
  mapping: Mapping;
}

interface NewRunContextType {
  files: File[];
  fileMappings: FileMapping[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (fileName: string) => void;
  updateFileMapping: (fileName: string, update: Partial<Omit<FileMapping, 'file'>>) => void;
  setFileColumns: (fileName: string, columns: string[]) => void;
}

const NewRunContext = createContext<NewRunContextType | undefined>(undefined);

export const NewRunProvider = ({ children }: { children: ReactNode }) => {
  const [fileMappings, setFileMappings] = useState<FileMapping[]>([]);

  const addFiles = (newFiles: File[]) => {
    const newFileMappings = newFiles
      .filter(newFile => !fileMappings.some(fm => fm.file.name === newFile.name))
      .map(file => ({ file, columns: [], mapping: {} }));
    
    setFileMappings(prev => [...prev, ...newFileMappings]);
  };

  const removeFile = (fileName: string) => {
    setFileMappings(prev => prev.filter(fm => fm.file.name !== fileName));
  };

  const updateFileMapping = (fileName:string, update: Partial<Omit<FileMapping, 'file'>>) => {
    setFileMappings(prev => prev.map(fm => 
      fm.file.name === fileName ? { ...fm, ...update } : fm
    ));
  };

  const setFileColumns = (fileName: string, columns: string[]) => {
    setFileMappings(prev => prev.map(fm => 
      fm.file.name === fileName ? { ...fm, columns } : fm
    ));
  };

  const files = fileMappings.map(fm => fm.file);

  return (
    <NewRunContext.Provider value={{ files, fileMappings, addFiles, removeFile, updateFileMapping, setFileColumns }}>
      {children}
    </NewRunContext.Provider>
  );
};

export const useNewRun = () => {
  const context = useContext(NewRunContext);
  if (context === undefined) {
    throw new Error('useNewRun must be used within a NewRunProvider');
  }
  return context;
};
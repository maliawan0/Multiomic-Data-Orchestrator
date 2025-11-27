import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ValidationIssue, runValidation as performValidation } from '@/lib/validation';

export interface Mapping {
  [canonicalField: string]: string; // maps canonical field to csv column
}

export interface FileMapping {
  file: File;
  templateId?: string;
  columns: string[];
  mapping: Mapping;
}

interface NewRunContextType {
  files: File[];
  fileMappings: FileMapping[];
  validationIssues: ValidationIssue[];
  runStatus: 'idle' | 'pending' | 'complete';
  addFiles: (newFiles: File[]) => void;
  removeFile: (fileName: string) => void;
  updateFileMapping: (fileName: string, update: Partial<Omit<FileMapping, 'file'>>) => void;
  setFileColumns: (fileName: string, columns: string[]) => void;
  runValidation: () => void;
  resetRun: () => void;
}

const NewRunContext = createContext<NewRunContextType | undefined>(undefined);

export const NewRunProvider = ({ children }: { children: ReactNode }) => {
  const [fileMappings, setFileMappings] = useState<FileMapping[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [runStatus, setRunStatus] = useState<'idle' | 'pending' | 'complete'>('idle');

  const addFiles = (newFiles: File[]) => {
    const newFileMappings = newFiles
      .filter(newFile => !fileMappings.some(fm => fm.file.name === newFile.name))
      .map(file => ({ file, columns: [], mapping: {} }));
    
    setFileMappings(prev => [...prev, ...newFileMappings]);
    setRunStatus('idle');
    setValidationIssues([]);
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

  const runValidation = () => {
    setRunStatus('pending');
    // Simulate async process
    setTimeout(() => {
      const issues = performValidation(fileMappings);
      setValidationIssues(issues);
      setRunStatus('complete');
    }, 500);
  };

  const resetRun = () => {
    setFileMappings([]);
    setValidationIssues([]);
    setRunStatus('idle');
  };

  const files = fileMappings.map(fm => fm.file);

  return (
    <NewRunContext.Provider value={{ 
      files, 
      fileMappings, 
      validationIssues,
      runStatus,
      addFiles, 
      removeFile, 
      updateFileMapping, 
      setFileColumns,
      runValidation,
      resetRun
    }}>
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
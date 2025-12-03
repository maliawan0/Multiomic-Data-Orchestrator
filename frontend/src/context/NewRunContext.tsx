import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { startRun, getRun } from '@/lib/api';
import logEvent from '@/lib/logger';

export interface Mapping {
  [canonicalField: string]: string; // maps canonical field to csv column
}

export interface FileMapping {
  file: File;
  templateId?: string;
  columns: string[];
  mapping: Mapping;
}

interface ValidationIssue {
  id: string;
  severity: 'Blocker' | 'Warning' | 'Info';
  fileName: string;
  rowIndex?: number;
  columnName?: string;
  description: string;
}

interface NewRunContextType {
  files: File[];
  fileMappings: FileMapping[];
  validationIssues: ValidationIssue[];
  runStatus: 'idle' | 'pending' | 'complete';
  runId: string | null;
  addFiles: (newFiles: File[]) => void;
  removeFile: (fileName: string) => void;
  updateFileMapping: (fileName: string, update: Partial<Omit<FileMapping, 'file'>>) => void;
  setFileColumns: (fileName: string, columns: string[]) => void;
  runValidation: () => Promise<void>;
  resetRun: () => void;
}

const NewRunContext = createContext<NewRunContextType | undefined>(undefined);

export const NewRunProvider = ({ children }: { children: ReactNode }) => {
  const [fileMappings, setFileMappings] = useState<FileMapping[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [runStatus, setRunStatus] = useState<'idle' | 'pending' | 'complete'>('idle');
  const [runId, setRunId] = useState<string | null>(null);

  const addFiles = (newFiles: File[]) => {
    const newFileMappings = newFiles
      .filter(newFile => !fileMappings.some(fm => fm.file.name === newFile.name))
      .map(file => ({ file, columns: [], mapping: {} }));
    
    setFileMappings(prev => [...prev, ...newFileMappings]);
    setRunStatus('idle');
    setValidationIssues([]);
    logEvent('FILES_UPLOADED', { count: newFiles.length, names: newFiles.map(f => f.name) });
  };

  const removeFile = (fileName: string) => {
    setFileMappings(prev => prev.filter(fm => fm.file.name !== fileName));
    logEvent('FILE_REMOVED', { fileName });
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

  const runValidation = useCallback(async () => {
    setRunStatus('pending');
    logEvent('VALIDATION_RUN_STARTED', { fileCount: fileMappings.length });

    const mappingData = fileMappings.map(fm => ({
      fileName: fm.file.name,
      templateId: fm.templateId,
      mapping: fm.mapping,
    }));

    try {
      const { run_id } = await startRun(fileMappings.map(fm => fm.file), mappingData);
      setRunId(run_id);
    } catch (error) {
      console.error("Failed to start run", error);
      setRunStatus('idle');
    }
  }, [fileMappings]);

  useEffect(() => {
    let pollTimeoutId: NodeJS.Timeout;

    const poll = async () => {
      if (runId) {
        try {
          const result = await getRun(runId);
          if (result.status === 'complete') {
            setValidationIssues(result.validation_issues || []);
            setRunStatus('complete');
            logEvent('VALIDATION_RUN_COMPLETED', {
              runId,
              blockers: (result.validation_issues || []).filter((i: any) => i.type === 'Blocker').length,
              warnings: (result.validation_issues || []).filter((i: any) => i.type === 'Warning').length,
            });
          } else {
            pollTimeoutId = setTimeout(poll, 2000); // Poll every 2 seconds
          }
        } catch (error) {
          console.error(`Failed to get run status for ${runId}`, error);
          // Optional: Stop polling on error or implement retry logic
        }
      }
    };

    if (runStatus === 'pending' && runId) {
      poll();
    }

    return () => {
      clearTimeout(pollTimeoutId);
    };
  }, [runId, runStatus]);

  const resetRun = () => {
    setFileMappings([]);
    setValidationIssues([]);
    setRunStatus('idle');
    setRunId(null);
    logEvent('NEW_RUN_RESET');
  };

  const files = fileMappings.map(fm => fm.file);

  return (
    <NewRunContext.Provider value={{
      files,
      fileMappings,
      validationIssues,
      runStatus,
      runId,
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
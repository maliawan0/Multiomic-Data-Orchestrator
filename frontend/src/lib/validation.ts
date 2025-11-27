import { FileMapping } from "@/context/NewRunContext";
import { schemaTemplates } from "./schemas";

export type IssueSeverity = 'Blocker' | 'Warning' | 'Info';

export interface ValidationIssue {
  id: string;
  fileName: string;
  rowIndex?: number;
  columnName?: string;
  severity: IssueSeverity;
  ruleId: string;
  description: string;
}

// This is a mock validation engine to simulate the backend process.
export const runValidation = (fileMappings: FileMapping[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  let issueCount = 0;

  fileMappings.forEach(fm => {
    const template = schemaTemplates.find(t => t.id === fm.templateId);
    if (!template) {
      issues.push({
        id: `issue-${issueCount++}`,
        fileName: fm.file.name,
        severity: 'Blocker',
        ruleId: 'VAL-001',
        description: 'No schema template selected for this file.',
      });
      return; // Skip other checks for this file
    }

    // Check for unmapped required fields
    template.fields.forEach(field => {
      if (field.required && !fm.mapping[field.name]) {
        issues.push({
          id: `issue-${issueCount++}`,
          fileName: fm.file.name,
          severity: 'Blocker',
          ruleId: 'VAL-002',
          description: `Required field '${field.name}' is not mapped.`,
        });
      }
    });

    // --- Mock Row-Level and Cross-File Issues for Demonstration ---

    // Mock a warning for a specific field if it exists
    if (fm.mapping['Chemistry']) {
        issues.push({
            id: `issue-${issueCount++}`,
            fileName: fm.file.name,
            rowIndex: 5,
            columnName: fm.mapping['Chemistry'],
            severity: 'Warning',
            ruleId: 'VAL-101',
            description: `Value 'v2.1' is not a recognized 10x Chemistry version.`,
        });
    }

    // Mock a blocker for a missing library ID
    if (fm.mapping['Library_ID'] && fm.file.name.includes('Illumina')) {
        issues.push({
            id: `issue-${issueCount++}`,
            fileName: fm.file.name,
            rowIndex: 12,
            columnName: fm.mapping['Library_ID'],
            severity: 'Blocker',
            ruleId: 'VAL-201',
            description: `Library_ID 'LIB-012' does not have a corresponding entry in the 10x Single-Cell metadata.`,
        });
    }
  });

  if (issues.length === 0) {
    issues.push({
        id: `issue-${issueCount++}`,
        fileName: 'System',
        severity: 'Info',
        ruleId: 'VAL-000',
        description: 'Validation successful. No blockers or warnings found.',
    });
  }

  return issues;
};
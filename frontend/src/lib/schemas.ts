export interface CanonicalField {
  name: string;
  type: 'string' | 'integer' | 'float' | 'date' | 'boolean';
  required: boolean;
  description: string;
  example?: string;
}

export interface SchemaTemplate {
  id: string;
  name: string;
  version: string;
  platform: string;
  description: string;
  fields: CanonicalField[];
}

export const schemaTemplates: SchemaTemplate[] = [
  {
    id: 'illumina-ngs-run-v1.2',
    name: 'Illumina NGS Run',
    version: '1.2',
    platform: 'Illumina',
    description: 'Metadata for a standard Illumina sequencing run.',
    fields: [
      { name: 'Run_ID', type: 'string', required: true, description: 'Unique identifier for the sequencing run.' },
      { name: 'Sample_ID', type: 'string', required: true, description: 'Identifier for the sample being sequenced.' },
      { name: 'Library_ID', type: 'string', required: true, description: 'Identifier for the sequencing library.' },
      { name: 'Lane', type: 'integer', required: true, description: 'Flowcell lane number.' },
      { name: 'Index_I1', type: 'string', required: true, description: 'The first index sequence (i7).' },
      { name: 'Index_I2', type: 'string', required: false, description: 'The second index sequence (i5), if applicable.' },
    ],
  },
  {
    id: '10x-single-cell-v2.0',
    name: '10x Single-Cell',
    version: '2.0',
    platform: '10x Genomics',
    description: 'Metadata for 10x Genomics single-cell library preparation.',
    fields: [
      { name: 'Library_ID', type: 'string', required: true, description: 'Unique identifier for the 10x library.' },
      { name: 'Sample_ID', type: 'string', required: true, description: 'Source sample identifier.' },
      { name: 'Chemistry', type: 'string', required: true, description: 'The 10x Genomics chemistry version used.' },
      { name: 'Expected_Cells', type: 'integer', required: false, description: 'The number of cells targeted.' },
    ],
  },
  {
    id: 'spatial-visium-v1.0',
    name: 'Spatial - Visium',
    version: '1.0',
    platform: '10x Genomics',
    description: 'Metadata for a 10x Visium spatial transcriptomics experiment.',
    fields: [
      { name: 'Slide_ID', type: 'string', required: true, description: 'The serial number of the Visium slide.' },
      { name: 'Capture_Area', type: 'string', required: true, description: 'The capture area on the slide (e.g., A1, B1).' },
      { name: 'Library_ID', type: 'string', required: true, description: 'Identifier for the library generated from this capture area.' },
      { name: 'Block_ID', type: 'string', required: true, description: 'Identifier for the FFPE block or tissue source.' },
    ],
  },
];
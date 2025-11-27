---
title: Product Requirements Document
app: vibrant-beaver-sprint
created: 2025-11-27T19:23:35.411Z
version: 1
source: Deep Mode PRD Generation
---

# PRODUCT REQUIREMENTS DOCUMENT
**Multiomic Data Orchestrator (MDO)**

## EXECUTIVE SUMMARY
**Product Vision:** To provide a deterministic metadata harmonization workflow for multiomic studies, ensuring data integrity, alignment across platforms, and reproducibility for research and regulated environments.

**Core Purpose:** The Multiomic Data Orchestrator (MDO) solves the critical problem of fragmented and misaligned metadata in FFPE-based multiomic studies. By enforcing a canonical data model and validating referential integrity across different data modalities (spatial transcriptomics, sequencing assays, library preps), MDO eliminates manual data wrangling, prevents costly run failures due to metadata errors, and ensures a consistent Chain of Identity for downstream analysis and regulatory submissions.

**Target Users:**
*   **Platform Operators:** Prepare and QC metadata before instrument runs.
*   **Bioinformaticians / Data Engineers:** Consume harmonized metadata to drive analysis pipelines.
*   **Principal Investigators / Study Leads:** Require confidence in the integrity of their multiomic data.
*   **QA / Regulatory / Compliance Officers:** Need auditable and reproducible data lineage.

**Key Features:**
*   **Template-Driven Metadata Ingestion:** Users upload CSV files and map them to pre-defined, versioned schema templates for major platforms (Illumina, 10x Genomics, Spatial).
*   **Deterministic Harmonization & Validation:** The system enforces canonical identifiers, normalizes data formats, and validates data against a versioned rules engine to ensure referential integrity across entities (Block → Slide → ROI → Library → Run).
*   **Offline Remediation Workflow:** Users receive a detailed validation report to fix errors in their source files offline, then re-upload for re-validation, ensuring a clean and auditable data correction process.
*   **Gated Export Bundle:** Once all critical errors ("Blockers") are resolved, users can export a complete, harmonized bundle containing canonical data tables, a join index, and a manifest for seamless use in downstream pipelines.

**Complexity Assessment:** Moderate
*   **State Management:** Local (Each harmonization run is a discrete, self-contained process).
*   **External Integrations:** 0 (The system ingests and produces files, with no external API dependencies for its core logic).
*   **Business Logic:** Moderate (The core value is in the domain-specific rules engine for validating and harmonizing complex scientific metadata relationships. The logic is deterministic and explicit, not heuristic).
*   **Data Synchronization:** None.

**MVP Success Metrics:**
*   Users can successfully complete the entire core workflow: upload, map, validate, remediate (re-upload), and export a harmonized data bundle.
*   The validation engine correctly identifies and reports known classes of metadata errors based on the defined rulesets.
*   The exported data bundle is correctly structured and contains all specified artifacts (canonical tables, manifest, etc.).

## 1. USERS & PERSONAS
*   **Primary Persona: Alex, the Platform Operator**
    *   **Context:** Alex is responsible for preparing and quality-checking metadata for complex multiomic studies before loading them onto expensive sequencing and spatial profiling instruments. Errors in metadata can cause runs to fail, wasting significant time, reagents, and budget.
    *   **Goals:** To ensure all metadata for a study is correct, complete, and properly formatted *before* a run begins. To have a deterministic, repeatable process for metadata validation.
    *   **Needs:** A tool that provides clear, actionable pass/fail criteria for metadata files. A way to produce a consistent, analysis-ready metadata package for the bioinformatics team without manual spreadsheet manipulation.

*   **Secondary Personas:**
    *   **Priya, the Bioinformatician:** Consumes the output of MDO to run analysis pipelines. Needs consistent identifiers and clear relationships between different data modalities to correctly join and analyze the data.
    *   **Dr. Chen, the Principal Investigator:** Needs confidence that the scientific conclusions from a study are based on correctly linked samples and data, ensuring reproducibility and credibility.
    *   **Sam, the QA/Compliance Officer:** Requires a fully auditable trail of how metadata was processed, including the specific schema and rule versions used, to support regulatory submissions.

## 2. FUNCTIONAL REQUIREMENTS (Core MVP)
### 2.1 User-Requested Features (All are Priority 0)

*   **FR-001: CSV Metadata Ingestion**
    *   **Description:** Users can upload one or more metadata files in CSV (UTF-8) format. The system validates the file format and provides clear feedback if a file is invalid.
    *   **Entity Type:** User-Generated Content
    *   **User Benefit:** Provides a simple, universal method for getting metadata into the system from various instrument and lab sources.
    *   **Primary User:** Platform Operator
    *   **Lifecycle Operations:**
        *   **Create:** User uploads a CSV file via a file browser.
        *   **View:** System displays a summary of the uploaded file (name, size).
        *   **Delete:** User can remove an uploaded file from the current session before processing.
        *   **Edit:** Not allowed. Changes are made by re-uploading a corrected file.
    *   **Acceptance Criteria:**
        *   - [ ] Given a user is on the upload page, they can select one or more local files with a `.csv` extension.
        *   - [ ] Given a user uploads a valid CSV (UTF-8) file, the system accepts it and prepares it for the next step.
        *   - [ ] Given a user uploads a non-CSV file (e.g., XLSX, TSV), the system rejects it with a user-friendly error message.
        *   - [ ] Given a user uploads a file that is not UTF-8 encoded, the system rejects it with a clear error message.

*   **FR-002: Template-Driven Metadata Mapping**
    *   **Description:** For each uploaded CSV, the user can select a pre-defined, versioned Schema Template (e.g., "Illumina Run v1.2", "10x Single-Cell v2.0"). The user then manually maps the columns from their CSV to the canonical fields defined in the template using a simple UI.
    *   **Entity Type:** User-Generated Content (Mapping Configuration)
    *   **User Benefit:** Allows users to align their lab-specific CSV formats with the system's canonical model in a flexible but structured way. Saved mappings accelerate future runs.
    *   **Primary User:** Platform Operator
    *   **Lifecycle Operations (for Mapping Configuration):**
        *   **Create:** User selects a template and maps CSV columns to canonical fields for a given run.
        *   **View:** User can see the current mapping configuration.
        *   **Edit:** User can change column mappings before initiating the harmonization run.
        *   **Save/Reuse:** User can save a completed mapping configuration for future use.
        *   **List/Load:** User can see and load previously saved mapping configurations.
    *   **Acceptance Criteria:**
        *   - [ ] Given a file has been uploaded, the user can select a relevant Schema Template from a pre-populated dropdown list.
        *   - [ ] Given a template is selected, the system displays a list of all canonical fields from that template.
        *   - [ ] For each canonical field, the user can select a corresponding column from their uploaded CSV via a dropdown.
        *   - [ ] The system indicates which canonical fields are required and prevents the user from proceeding until all required fields are mapped.
        *   - [ ] The user can save the current set of mappings for later reuse.

*   **FR-003: Harmonization and Validation Run**
    *   **Description:** The user can initiate a run, which triggers a deterministic engine to harmonize the mapped data and validate it against a ruleset associated with the selected templates. The engine generates canonical IDs, normalizes formats, constructs entity relationships, and checks for violations.
    *   **Entity Type:** System Process (Harmonization Run)
    *   **User Benefit:** Automates the complex and error-prone task of data validation and integration, providing a clear, reproducible report of data quality.
    *   **Primary User:** Platform Operator
    *   **Lifecycle Operations (for Harmonization Run):**
        *   **Create:** User initiates a run after completing the mapping step.
        *   **View:** User views the results on a validation summary page, showing counts of Blockers, Warnings, and Info-level issues.
        *   **List:** User can view a history of their past runs.
    *   **Acceptance Criteria:**
        *   - [ ] Given a user has mapped all required fields, they can trigger a harmonization and validation run.
        *   - [ ] The system processes the data and generates canonical IDs for entities (Specimen, Block, Slide, etc.) based on deterministic rules.
        *   - [ ] The system validates the data against field-level, row-level, and relationship-level rules.
        *   - [ ] Upon completion, the system displays a summary of validation results, categorized by severity (Blocker, Warning, Info).

*   **FR-004: Offline Remediation via Validation Report**
    *   **Description:** Users can download a detailed Validation Report as a CSV file. This report lists every detected issue, including the file, row, column, severity, and a human-readable description. The user fixes these issues in their original source files (e.g., in Excel) and re-uploads the corrected CSVs to start a new run.
    *   **Entity Type:** System-Generated Content (Validation Report)
    *   **User Benefit:** Provides a clear, actionable list of all errors that need to be fixed, enabling a simple and auditable "fix-and-re-upload" workflow using familiar tools.
    *   **Primary User:** Platform Operator
    *   **Lifecycle Operations:**
        *   **Create:** The system generates the report as part of a validation run.
        *   **View:** Validation issues are displayed on a summary page in the UI.
        *   **Download:** User can download the complete report as a CSV file.
    *   **Acceptance Criteria:**
        *   - [ ] From the validation summary page, the user can download a Validation Report in CSV format.
        *   - [ ] The report contains columns for File Name, Row Index, Column Name, Severity, Rule ID, and Description.
        *   - [ ] The user can successfully re-upload a corrected CSV file to initiate a new validation run.
        *   - [ ] The system versions each run, allowing for a clear audit trail of the remediation process.

*   **FR-005: Gated Export of Harmonized Bundle**
    *   **Description:** An "Export" action is only enabled when a validation run completes with zero "Blocker" severity issues. A successful export generates a bundle of files containing the clean, harmonized data and associated metadata.
    *   **Entity Type:** System-Generated Content (Export Bundle)
    *   **User Benefit:** Ensures that only fully validated and internally consistent data is passed to downstream analysis pipelines, preventing data quality issues from propagating.
    *   **Primary User:** Platform Operator, Bioinformatician
    *   **Lifecycle Operations:**
        *   **Create:** User triggers the export once the readiness gate is passed.
        *   **Download:** The user can download the complete bundle as a single package (e.g., a zip file).
    *   **Acceptance Criteria:**
        *   - [ ] Given a validation run has 1 or more "Blocker" issues, the Export button is disabled.
        *   - [ ] Given a validation run has 0 "Blocker" issues, the Export button is enabled.
        *   - [ ] When the user clicks Export, the system generates a downloadable bundle.
        *   - [ ] The bundle must contain: Canonical data tables (CSV), a cross-modal join index (CSV), the mapping file, the final validation report, and a JSON manifest with run details and file hashes.

*   **FR-006: Audit Logging**
    *   **Description:** The system automatically logs all critical events with a timestamp, user ID, and relevant context (e.g., schema versions, run ID).
    *   **Entity Type:** System Data
    *   **User Benefit:** Provides a complete and defensible audit trail for regulatory compliance and reproducibility.
    *   **Primary User:** QA/Compliance Officer, Admin
    *   **Lifecycle Operations:**
        *   **Create:** System automatically creates log entries for key actions.
        *   **View:** Not available to end-users in MVP; accessible by system administrators.
    *   **Acceptance Criteria:**
        *   - [ ] The system logs events for: file uploads, template selections, harmonization runs, validation report downloads, and exports.
        *   - [ ] Each log entry includes a timestamp, the responsible user's ID, and content hashes where applicable.

### 2.2 Essential Market Features

*   **FR-007: User Authentication**
    *   **Description:** Users must register for an account and log in to use the application. Sessions are managed securely.
    *   **Entity Type:** System/Configuration
    *   **User Benefit:** Protects user data, enables personalization (like saved mappings), and provides user identity for audit logs.
    *   **Primary User:** All Personas
    *   **Lifecycle Operations:**
        *   **Create:** User can register for a new account.
        *   **View:** User can view their own profile information.
        *   **Edit:** User can update their profile information (e.g., password).
        *   **Delete:** User can delete their account.
        *   **Additional:** Password reset functionality.
    *   **Acceptance Criteria:**
        *   - [ ] A new user can create an account.
        *   - [ ] A registered user can log in with valid credentials.
        *   - [ ] An unauthenticated user cannot access the application's core features.
        *   - [ ] A user can reset their forgotten password.

## 3. USER WORKFLOWS
### 3.1 Primary Workflow: Metadata Harmonization and Export
*   **Trigger:** A Platform Operator needs to prepare and validate metadata for a new multiomic study.
*   **Outcome:** A complete, validated, and harmonized data bundle is generated and ready for the bioinformatics team.
*   **Steps:**
    1.  **Login:** User logs into the MDO application.
    2.  **Upload:** User navigates to the upload page and uploads one or more CSV files (e.g., Illumina run info, 10x library info, Spatial ROI info).
    3.  **Select & Map:** For each uploaded file, the user selects the appropriate Schema Template (e.g., "Illumina NGS Run v1.2"). The user then maps the columns from their CSV to the canonical fields shown in the UI.
    4.  **Initiate Run:** Once all required fields are mapped, the user clicks "Harmonize and Validate".
    5.  **Review Results:** The system processes the files and presents a validation summary.
    6.  **Decision Point:**
        *   **If 0 Blockers:** The "Export" button is enabled. The user proceeds to step 9.
        *   **If >0 Blockers:** The "Export" button is disabled. The user proceeds to step 7.
    7.  **Download Report:** The user clicks "Download Validation Report" to get a CSV detailing all errors.
    8.  **Remediate Offline:** The user opens their original source files and the validation report in a spreadsheet program (e.g., Excel). They correct all "Blocker" issues and save the corrected files as new CSVs. The user then returns to step 2 to re-upload the corrected files.
    9.  **Export:** The user clicks the enabled "Export" button.
    10. **Download Bundle:** The system generates and provides a link to download the final harmonized data bundle.

## 4. BUSINESS RULES
*   **Access Control:**
    *   All users must be authenticated to use the application.
    *   Users can only view and manage their own harmonization runs and saved mappings.
*   **Data Rules:**
    *   File uploads are strictly limited to CSV format with UTF-8 encoding.
    *   A harmonization run cannot be initiated until all required fields in the selected templates are mapped.
    *   The export functionality is strictly gated by the "Readiness Gate" rule: the run must have zero "Blocker" severity issues. Warnings and informational issues do not prevent export.
*   **Entity Lifecycle Rules:**
    *   **Harmonization Run:** Cannot be edited or deleted. A new run is created upon each re-upload to preserve the audit trail.
    *   **Schema Templates:** Are read-only for end-users. They are managed by administrators and versioned.
    *   **Mapping Configuration:** Can be created, viewed, updated, and deleted by the user who owns it.

## 5. DATA REQUIREMENTS
*   **Core Entities:**
    *   **User:**
        *   **Type:** System/Configuration
        *   **Attributes:** user_id, email, name, password_hash, created_at, updated_at.
    *   **SchemaTemplate:**
        *   **Type:** System/Configuration
        *   **Attributes:** template_id, name, version, platform (e.g., Illumina), definition (JSON schema of canonical fields), associated_ruleset_id.
    *   **MappingConfiguration:**
        *   **Type:** User-Generated Content
        *   **Attributes:** mapping_id, user_id, name, source_template_id, mapping_definition (JSON of CSV column -> canonical field).
    *   **HarmonizationRun:**
        *   **Type:** System Process
        *   **Attributes:** run_id, user_id, status (e.g., running, failed, complete), created_at, completed_at, associated_mapping_ids, validation_summary (JSON of issue counts).
    *   **ValidationIssue:**
        *   **Type:** System-Generated Content
        *   **Attributes:** issue_id, run_id, source_file_name, row_index, column_name, severity (Blocker, Warning, Info), rule_id, description.
    *   **ExportBundle:**
        *   **Type:** System-Generated Content
        *   **Attributes:** bundle_id, run_id, created_at, storage_path, manifest (JSON).

## 6. MVP SCOPE & DEFERRED FEATURES
### 6.1 MVP Success Definition
The MVP is successful if a Platform Operator can take raw, unvalidated metadata CSVs from Illumina, 10x, and Spatial platforms and use the MDO to produce a single, harmonized, and validated data bundle that is ready for downstream analysis, completing the entire workflow defined in Section 3.1.

### 6.2 In Scope for MVP
*   FR-001: CSV Metadata Ingestion
*   FR-002: Template-Driven Metadata Mapping
*   FR-003: Harmonization and Validation Run
*   FR-004: Offline Remediation via Validation Report
*   FR-005: Gated Export of Harmonized Bundle
*   FR-006: Audit Logging
*   FR-007: User Authentication

### 6.3 Deferred Features (Post-MVP Roadmap)
*   **DF-001: Support for Additional File Formats (TSV, XLSX)**
    *   **Description:** Allow users to upload metadata in formats other than CSV.
    *   **Reason for Deferral:** Adds significant implementation and testing complexity for parsing. CSV is a universal format that all target platforms can export to, making it sufficient for the MVP.
*   **DF-002: Automated Schema Detection and Mapping Suggestions**
    *   **Description:** Automatically detect the schema of an uploaded file and suggest column mappings.
    *   **Reason for Deferral:** High complexity feature that is not essential for the core validation workflow. The manual, template-driven approach is more deterministic and suitable for regulated environments.
*   **DF-003: In-App Data Remediation (Inline Editing)**
    *   **Description:** A spreadsheet-like interface within the MDO for users to directly edit their data and fix validation errors.
    *   **Reason for Deferral:** Extremely high implementation complexity ("building Excel in the browser"). The "fix-and-re-upload" model leverages existing, powerful tools (Excel, Google Sheets) that users are already experts in.
*   **DF-004: Support for Additional Modalities and Platforms**
    *   **Description:** Add schema templates and rulesets for MS-only multiomics, high-plex proteomics (Olink, SomaScan), and non-Illumina NGS platforms (PacBio, ONT).
    *   **Reason for Deferral:** Strategic focus. The MVP targets the dominant Illumina-anchored ecosystem to provide maximum value with the initial release. Other platforms can be added incrementally post-MVP.
*   **DF-005: Administrator Console**
    *   **Description:** A UI for administrators to manage schema templates, rulesets, and users.
    *   **Reason for Deferral:** Not part of the primary user's core workflow. For the MVP, schemas and rules can be managed via configuration files or direct database access by the development team.
*   **DF-006: Enhanced Validation Guidance (LLM Explanations)**
    *   **Description:** Use an LLM to provide more detailed, context-aware explanations for validation errors.
    *   **Reason for Deferral:** A "nice-to-have" enhancement. The core value is in the deterministic detection of errors; the human-readable descriptions are sufficient for the MVP.

## 7. ASSUMPTIONS & DECISIONS
*   **Key Assumptions:**
    *   The initial set of versioned Schema Templates and their corresponding validation rulesets for Illumina, 10x, and Spatial platforms will be provided by domain experts as configuration.
    *   Users (Platform Operators) are proficient with spreadsheet software (like Excel) and can export data to a clean CSV (UTF-8) format.
    *   For the MVP, handling of PII/PHI within the metadata is out of scope. The system will validate structure and format, not the semantic content of the data for compliance patterns.
    *   The canonical format for all date/time fields will be ISO-8601.
*   **Key Decisions:**
    *   The MVP will use a "fix-and-re-upload" remediation workflow to avoid the complexity of building an in-app data editor.
    *   The MVP will be strictly limited to CSV file ingestion to ensure a simple, reliable data entry point.
    *   The MVP will not include any heuristic or AI-based "auto-detection" features to maintain a fully deterministic and auditable process.

PRD Complete - Ready for development
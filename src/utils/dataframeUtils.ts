/**
 * Utility functions for working with dataframes in the context of Supabase
 */

import { storeDataframesInSupabase, SupabaseDataStorage } from './supabaseDataStorage';

/**
 * Validates a dataframe against expected schema
 * 
 * @param dataframe The dataframe to validate
 * @param expectedColumns Array of expected column names
 * @param requiredColumns Array of columns that must not be null
 * @returns Validation result with errors if any
 */
export function validateDataframe(
  dataframe: any[],
  expectedColumns: string[],
  requiredColumns: string[] = []
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if dataframe is empty
  if (!dataframe || dataframe.length === 0) {
    errors.push('Dataframe is empty');
    return { valid: false, errors };
  }
  
  // Get columns from first row
  const sampleRow = dataframe[0];
  const actualColumns = Object.keys(sampleRow);
  
  // Check for missing expected columns
  const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Missing expected columns: ${missingColumns.join(', ')}`);
  }
  
  // Check for required columns with null values
  for (const row of dataframe) {
    for (const col of requiredColumns) {
      if (row[col] === null || row[col] === undefined) {
        errors.push(`Required column '${col}' has null values`);
        break; // Only report each required column once
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Converts a CSV string to a dataframe (array of objects)
 * 
 * @param csvString The CSV string to convert
 * @param options Options for parsing
 * @returns Array of objects representing the CSV data
 */
export function csvToDataframe(
  csvString: string,
  options: { 
    delimiter?: string; 
    hasHeader?: boolean;
    skipEmptyLines?: boolean;
    trimValues?: boolean;
  } = {}
): any[] {
  const {
    delimiter = ',',
    hasHeader = true,
    skipEmptyLines = true,
    trimValues = true
  } = options;
  
  // Split the CSV string into lines
  const lines = csvString.split('\n');
  
  // Filter out empty lines if requested
  const filteredLines = skipEmptyLines 
    ? lines.filter(line => line.trim() !== '') 
    : lines;
  
  if (filteredLines.length === 0) {
    return [];
  }
  
  // Get headers
  const headerLine = filteredLines[0];
  const headers = headerLine.split(delimiter).map(header => 
    trimValues ? header.trim() : header
  );
  
  // Start from line 1 if there's a header, otherwise from line 0
  const startIndex = hasHeader ? 1 : 0;
  const result = [];
  
  // Process data rows
  for (let i = startIndex; i < filteredLines.length; i++) {
    const line = filteredLines[i];
    const values = line.split(delimiter);
    
    // Create an object for this row
    const row: Record<string, any> = {};
    
    // If we have headers, use them as keys
    if (hasHeader) {
      for (let j = 0; j < headers.length; j++) {
        const value = j < values.length ? values[j] : '';
        row[headers[j]] = trimValues ? value.trim() : value;
      }
    } else {
      // Without headers, use numeric indices as keys
      for (let j = 0; j < values.length; j++) {
        const value = values[j];
        row[`column${j}`] = trimValues ? value.trim() : value;
      }
    }
    
    result.push(row);
  }
  
  return result;
}

/**
 * Converts a dataframe to a CSV string
 * 
 * @param dataframe The dataframe to convert
 * @param options Options for formatting
 * @returns CSV string representation of the dataframe
 */
export function dataframeToCsv(
  dataframe: any[],
  options: {
    delimiter?: string;
    includeHeader?: boolean;
    columns?: string[];
  } = {}
): string {
  const {
    delimiter = ',',
    includeHeader = true,
    columns
  } = options;
  
  if (!dataframe || dataframe.length === 0) {
    return '';
  }
  
  // Determine columns to include
  const columnsToInclude = columns || Object.keys(dataframe[0]);
  
  // Build CSV string
  let csv = '';
  
  // Add header row if requested
  if (includeHeader) {
    csv += columnsToInclude.join(delimiter) + '\n';
  }
  
  // Add data rows
  for (const row of dataframe) {
    const values = columnsToInclude.map(col => {
      const value = row[col];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains delimiter or newline
        if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Convert objects to JSON strings
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        return String(value);
      }
    });
    
    csv += values.join(delimiter) + '\n';
  }
  
  return csv;
}

/**
 * Stores a dataframe in Supabase with comprehensive validation and error handling
 * 
 * @param dataframe The dataframe to store
 * @param tableName The table to store the dataframe in
 * @param options Storage options
 * @returns Result of the storage operation
 */
export async function storeDataframe(
  dataframe: any[],
  tableName: string,
  options: {
    validateSchema?: boolean;
    expectedColumns?: string[];
    requiredColumns?: string[];
    batchSize?: number;
    replaceExisting?: boolean;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<{ success: boolean; message: string; details?: any }> {
  const {
    validateSchema = true,
    expectedColumns,
    requiredColumns,
    batchSize = 1000,
    replaceExisting = false,
    onProgress
  } = options;
  
  try {
    // Validate dataframe if requested
    if (validateSchema && expectedColumns) {
      const { valid, errors } = validateDataframe(
        dataframe,
        expectedColumns,
        requiredColumns
      );
      
      if (!valid) {
        return {
          success: false,
          message: 'Dataframe validation failed',
          details: { errors }
        };
      }
    }
    
    // Store the dataframe
    return await storeDataframesInSupabase(
      [dataframe],
      [tableName],
      {
        batchSize,
        replaceExisting,
        onProgress
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: errorMessage };
  }
}

/**
 * Creates a custom validator function for use with storeDataframesInSupabase
 * 
 * @param validationFn The validation function to wrap
 * @returns A validator function compatible with storeDataframesInSupabase
 */
export function createCustomValidator(
  validationFn: (data: any[]) => { valid: boolean; errors?: string[] }
): (data: any[]) => { valid: boolean; errors?: string[] } {
  return validationFn;
}

/**
 * Checks if the Supabase connection is ready for storing dataframes
 */
export async function checkSupabaseReadiness(): Promise<{ ready: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  // Check connection
  const { connected, error: connectionError } = await SupabaseDataStorage.verifyConnection();
  if (!connected) {
    issues.push(`Connection issue: ${connectionError}`);
    return { ready: false, issues };
  }
  
  // Check if helper functions are available
  try {
    const { success, error } = await SupabaseDataStorage.setupHelperFunctions();
    if (!success) {
      issues.push(`Helper functions not available: ${error}`);
      // This is not critical, so we continue
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    issues.push(`Error checking helper functions: ${errorMessage}`);
    // Continue anyway
  }
  
  return {
    ready: issues.length === 0,
    issues
  };
}
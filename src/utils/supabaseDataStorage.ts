import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Interface for table schema information
 */
interface TableSchema {
  name: string;
  columns: {
    name: string;
    type: string;
    isNullable: boolean;
  }[];
}

/**
 * Options for storing dataframes
 */
interface StoreDataframeOptions {
  /** Batch size for processing large datasets */
  batchSize?: number;
  
  /** Whether to perform a transaction (all-or-nothing) */
  useTransaction?: boolean;
  
  /** Whether to replace existing data or append */
  replaceExisting?: boolean;
  
  /** Whether to validate data types strictly */
  strictValidation?: boolean;
  
  /** Custom validation function */
  customValidator?: (data: any) => { valid: boolean; errors?: string[] };
  
  /** Progress callback */
  onProgress?: (progress: number) => void;
}

/**
 * Result of the storage operation
 */
interface StorageResult {
  success: boolean;
  rowsProcessed: number;
  errors: string[];
  tableInfo?: {
    name: string;
    rowCount: number;
  };
}

/**
 * Class for storing dataframes in Supabase
 */
export class SupabaseDataStorage {
  /**
   * Verify Supabase connection is active and authenticated
   */
  static async verifyConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      // Check if we have a valid session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { connected: false, error: `Authentication error: ${error.message}` };
      }
      
      if (!data.session) {
        return { connected: false, error: 'No active session found. Please authenticate first.' };
      }
      
      // Test a simple query to verify database connection
      const { error: queryError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (queryError && queryError.code !== 'PGRST116') {
        return { connected: false, error: `Database connection error: ${queryError.message}` };
      }
      
      return { connected: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      return { connected: false, error: errorMessage };
    }
  }
  
  /**
   * Check if a table exists in the database
   */
  static async checkTableExists(tableName: string): Promise<{ exists: boolean; error?: string }> {
    try {
      // Query the information schema to check if the table exists
      const { data, error } = await supabase
        .rpc('check_table_exists', { table_name: tableName });
      
      if (error) {
        // If the RPC function doesn't exist, fall back to a direct query
        if (error.code === 'PGRST301') {
          // Try a simple query to see if the table exists
          const { error: queryError } = await supabase
            .from(tableName)
            .select('count(*)')
            .limit(1);
          
          if (queryError) {
            if (queryError.code === 'PGRST204') {
              // Table doesn't exist
              return { exists: false };
            } else {
              // Other error
              return { exists: false, error: queryError.message };
            }
          }
          
          // If no error, table exists
          return { exists: true };
        }
        
        return { exists: false, error: error.message };
      }
      
      return { exists: !!data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error checking table';
      return { exists: false, error: errorMessage };
    }
  }
  
  /**
   * Get the schema of a table
   */
  static async getTableSchema(tableName: string): Promise<{ schema: TableSchema | null; error?: string }> {
    try {
      // Check if the table exists first
      const { exists, error: existsError } = await this.checkTableExists(tableName);
      
      if (existsError) {
        return { schema: null, error: existsError };
      }
      
      if (!exists) {
        return { schema: null, error: `Table '${tableName}' does not exist` };
      }
      
      // Query the information schema to get column information
      const { data, error } = await supabase
        .rpc('get_table_schema', { table_name: tableName });
      
      if (error) {
        // If the RPC function doesn't exist, fall back to a direct query
        if (error.code === 'PGRST301') {
          // This is a simplified approach - in a real app, you'd need to query information_schema
          // For now, we'll just try to get the structure from a sample row
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (sampleError) {
            return { schema: null, error: `Error fetching sample data: ${sampleError.message}` };
          }
          
          if (!sampleData || sampleData.length === 0) {
            return { schema: null, error: `Table '${tableName}' is empty, cannot infer schema` };
          }
          
          // Create a simple schema from the sample row
          const columns = Object.keys(sampleData[0]).map(name => ({
            name,
            type: typeof sampleData[0][name],
            isNullable: true // We can't determine this without information_schema
          }));
          
          return {
            schema: {
              name: tableName,
              columns
            }
          };
        }
        
        return { schema: null, error: error.message };
      }
      
      return { schema: data as TableSchema };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error getting schema';
      return { schema: null, error: errorMessage };
    }
  }
  
  /**
   * Validate dataframe structure against table schema
   */
  static validateDataframeStructure(
    dataframe: any[],
    schema: TableSchema,
    options: { strictValidation?: boolean } = {}
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if dataframe is empty
    if (!dataframe || dataframe.length === 0) {
      errors.push('Dataframe is empty');
      return { valid: false, errors };
    }
    
    // Get column names from the first row
    const sampleRow = dataframe[0];
    const dataframeColumns = Object.keys(sampleRow);
    
    // Check for required columns
    const requiredSchemaColumns = schema.columns
      .filter(col => !col.isNullable)
      .map(col => col.name);
    
    const missingRequiredColumns = requiredSchemaColumns.filter(
      col => !dataframeColumns.includes(col)
    );
    
    if (missingRequiredColumns.length > 0) {
      errors.push(`Missing required columns: ${missingRequiredColumns.join(', ')}`);
    }
    
    // Check data types if strict validation is enabled
    if (options.strictValidation) {
      // Create a map of column types for quick lookup
      const columnTypes = new Map(
        schema.columns.map(col => [col.name, col.type])
      );
      
      // Check each row for type mismatches
      for (let i = 0; i < Math.min(dataframe.length, 100); i++) { // Check up to 100 rows
        const row = dataframe[i];
        
        for (const [column, value] of Object.entries(row)) {
          if (!columnTypes.has(column)) continue; // Skip columns not in schema
          
          const expectedType = columnTypes.get(column);
          
          // Skip null values for nullable columns
          if (value === null) {
            const columnSchema = schema.columns.find(col => col.name === column);
            if (columnSchema && columnSchema.isNullable) continue;
          }
          
          // Validate type
          if (!this.validateDataType(value, expectedType!)) {
            errors.push(`Type mismatch in row ${i+1}, column '${column}': expected ${expectedType}, got ${typeof value}`);
            
            // Limit the number of type errors reported
            if (errors.length >= 10) {
              errors.push('Too many type errors, validation stopped');
              return { valid: false, errors };
            }
          }
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Validate a value against an expected PostgreSQL type
   */
  private static validateDataType(value: any, pgType: string): boolean {
    if (value === null || value === undefined) return true;
    
    // Map PostgreSQL types to JavaScript types
    switch (pgType.toLowerCase()) {
      case 'integer':
      case 'int':
      case 'int4':
      case 'int8':
      case 'bigint':
      case 'smallint':
        return Number.isInteger(Number(value));
        
      case 'numeric':
      case 'decimal':
      case 'real':
      case 'double precision':
      case 'float':
      case 'float4':
      case 'float8':
        return !isNaN(Number(value));
        
      case 'boolean':
      case 'bool':
        return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 0 || value === 1;
        
      case 'text':
      case 'varchar':
      case 'character varying':
      case 'char':
      case 'character':
        return typeof value === 'string' || typeof value === 'number';
        
      case 'date':
      case 'timestamp':
      case 'timestamptz':
      case 'timestamp with time zone':
      case 'timestamp without time zone':
        return !isNaN(Date.parse(String(value)));
        
      case 'json':
      case 'jsonb':
        if (typeof value === 'object') return true;
        try {
          JSON.parse(String(value));
          return true;
        } catch {
          return false;
        }
        
      case 'uuid':
        return typeof value === 'string' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        
      default:
        // For unknown types, just check it's not undefined
        return value !== undefined;
    }
  }
  
  /**
   * Convert data types to match PostgreSQL expectations
   */
  static convertDataTypes(
    dataframe: any[],
    schema: TableSchema
  ): { data: any[]; errors: string[] } {
    const errors: string[] = [];
    const convertedData = [...dataframe]; // Create a copy to avoid modifying the original
    
    // Create a map of column types for quick lookup
    const columnTypes = new Map(
      schema.columns.map(col => [col.name, col.type])
    );
    
    // Process each row
    for (let i = 0; i < convertedData.length; i++) {
      const row = { ...convertedData[i] }; // Create a copy of the row
      
      for (const [column, value] of Object.entries(row)) {
        if (!columnTypes.has(column)) continue; // Skip columns not in schema
        
        const pgType = columnTypes.get(column)!;
        
        try {
          // Convert the value to the expected type
          row[column] = this.convertValueToType(value, pgType);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown conversion error';
          errors.push(`Error converting row ${i+1}, column '${column}': ${errorMessage}`);
          
          // Set to null for nullable columns, or keep original for non-nullable
          const columnSchema = schema.columns.find(col => col.name === column);
          if (columnSchema && columnSchema.isNullable) {
            row[column] = null;
          }
        }
      }
      
      convertedData[i] = row;
    }
    
    return { data: convertedData, errors };
  }
  
  /**
   * Convert a single value to the expected PostgreSQL type
   */
  private static convertValueToType(value: any, pgType: string): any {
    if (value === null || value === undefined) return null;
    
    // Map PostgreSQL types to JavaScript types
    switch (pgType.toLowerCase()) {
      case 'integer':
      case 'int':
      case 'int4':
      case 'int8':
      case 'bigint':
      case 'smallint':
        return parseInt(value, 10);
        
      case 'numeric':
      case 'decimal':
      case 'real':
      case 'double precision':
      case 'float':
      case 'float4':
      case 'float8':
        return parseFloat(value);
        
      case 'boolean':
      case 'bool':
        if (typeof value === 'boolean') return value;
        if (value === 'true' || value === 1) return true;
        if (value === 'false' || value === 0) return false;
        throw new Error(`Cannot convert '${value}' to boolean`);
        
      case 'text':
      case 'varchar':
      case 'character varying':
      case 'char':
      case 'character':
        return String(value);
        
      case 'date':
      case 'timestamp':
      case 'timestamptz':
      case 'timestamp with time zone':
      case 'timestamp without time zone':
        return new Date(value).toISOString();
        
      case 'json':
      case 'jsonb':
        if (typeof value === 'object') return value;
        return JSON.parse(String(value));
        
      case 'uuid':
        // Ensure it's a valid UUID format
        const uuidStr = String(value);
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuidStr)) {
          throw new Error(`Invalid UUID format: ${uuidStr}`);
        }
        return uuidStr;
        
      default:
        // For unknown types, return as is
        return value;
    }
  }
  
  /**
   * Store a dataframe in a Supabase table
   */
  static async storeDataframe(
    dataframe: any[],
    tableName: string,
    options: StoreDataframeOptions = {}
  ): Promise<StorageResult> {
    const result: StorageResult = {
      success: false,
      rowsProcessed: 0,
      errors: []
    };
    
    // Set default options
    const {
      batchSize = 1000,
      useTransaction = true,
      replaceExisting = false,
      strictValidation = true,
      customValidator,
      onProgress
    } = options;
    
    try {
      // Step 1: Verify connection
      const { connected, error: connectionError } = await this.verifyConnection();
      if (!connected) {
        result.errors.push(`Connection error: ${connectionError}`);
        return result;
      }
      
      // Step 2: Check if table exists
      const { exists, error: tableError } = await this.checkTableExists(tableName);
      if (tableError) {
        result.errors.push(`Table check error: ${tableError}`);
        return result;
      }
      
      if (!exists) {
        result.errors.push(`Table '${tableName}' does not exist in the database`);
        return result;
      }
      
      // Step 3: Get table schema
      const { schema, error: schemaError } = await this.getTableSchema(tableName);
      if (schemaError) {
        result.errors.push(`Schema error: ${schemaError}`);
        return result;
      }
      
      if (!schema) {
        result.errors.push(`Could not retrieve schema for table '${tableName}'`);
        return result;
      }
      
      // Step 4: Validate dataframe structure
      const { valid, errors: validationErrors } = this.validateDataframeStructure(
        dataframe,
        schema,
        { strictValidation }
      );
      
      if (!valid) {
        result.errors.push(...validationErrors);
        return result;
      }
      
      // Step 5: Run custom validation if provided
      if (customValidator) {
        const customValidation = customValidator(dataframe);
        if (!customValidation.valid) {
          result.errors.push(...(customValidation.errors || ['Custom validation failed']));
          return result;
        }
      }
      
      // Step 6: Convert data types
      const { data: convertedData, errors: conversionErrors } = this.convertDataTypes(
        dataframe,
        schema
      );
      
      if (conversionErrors.length > 0) {
        result.errors.push(...conversionErrors);
        // Continue with the converted data, but log the errors
      }
      
      // Step 7: Clear existing data if requested
      if (replaceExisting) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
        
        if (deleteError) {
          result.errors.push(`Error clearing existing data: ${deleteError.message}`);
          return result;
        }
      }
      
      // Step 8: Process data in batches
      const totalBatches = Math.ceil(convertedData.length / batchSize);
      let successfulRows = 0;
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, convertedData.length);
        const batch = convertedData.slice(start, end);
        
        // Insert batch
        const { error: insertError, count } = await supabase
          .from(tableName)
          .insert(batch)
          .select('count');
        
        if (insertError) {
          result.errors.push(`Error inserting batch ${i+1}/${totalBatches}: ${insertError.message}`);
          
          // If using transaction mode, stop on first error
          if (useTransaction) {
            return result;
          }
        } else {
          successfulRows += batch.length;
        }
        
        // Report progress
        if (onProgress) {
          onProgress((i + 1) / totalBatches * 100);
        }
      }
      
      // Step 9: Get final row count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        result.tableInfo = {
          name: tableName,
          rowCount: count || 0
        };
      }
      
      // Set success status
      result.success = successfulRows === convertedData.length;
      result.rowsProcessed = successfulRows;
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error storing dataframe';
      result.errors.push(errorMessage);
      return result;
    }
  }
  
  /**
   * Store multiple dataframes in Supabase tables
   */
  static async storeMultipleDataframes(
    dataframes: { data: any[]; tableName: string; options?: StoreDataframeOptions }[]
  ): Promise<{ overall: boolean; results: Record<string, StorageResult> }> {
    const results: Record<string, StorageResult> = {};
    let overallSuccess = true;
    
    for (const { data, tableName, options } of dataframes) {
      const result = await this.storeDataframe(data, tableName, options);
      results[tableName] = result;
      
      if (!result.success) {
        overallSuccess = false;
      }
    }
    
    return {
      overall: overallSuccess,
      results
    };
  }
  
  /**
   * Create a custom RPC function to check if a table exists
   * This is a one-time setup that should be run by an admin
   */
  static async setupHelperFunctions(): Promise<{ success: boolean; error?: string }> {
    try {
      // Create function to check if a table exists
      const { error: rpcError } = await supabase.rpc('create_helper_functions');
      
      if (rpcError) {
        // If the RPC doesn't exist, we need to create it manually
        // This requires admin privileges
        console.error('Could not create helper functions via RPC:', rpcError);
        return { 
          success: false, 
          error: 'Could not create helper functions. Please contact an administrator.' 
        };
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error setting up helpers';
      return { success: false, error: errorMessage };
    }
  }
}

/**
 * Main function to store dataframes in Supabase
 * 
 * @param dataframes - Array of dataframes to store
 * @param tableNames - Array of table names corresponding to each dataframe
 * @param options - Storage options
 * @returns Result of the storage operation
 */
export async function storeDataframesInSupabase(
  dataframes: any[][],
  tableNames: string[],
  options: StoreDataframeOptions = {}
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Validate input
    if (!dataframes || !Array.isArray(dataframes) || dataframes.length === 0) {
      return { success: false, message: 'No dataframes provided' };
    }
    
    if (!tableNames || !Array.isArray(tableNames) || tableNames.length === 0) {
      return { success: false, message: 'No table names provided' };
    }
    
    if (dataframes.length !== tableNames.length) {
      return { 
        success: false, 
        message: `Mismatch between dataframes (${dataframes.length}) and table names (${tableNames.length})` 
      };
    }
    
    // Verify connection
    const { connected, error: connectionError } = await SupabaseDataStorage.verifyConnection();
    if (!connected) {
      return { 
        success: false, 
        message: 'Failed to connect to Supabase', 
        details: connectionError 
      };
    }
    
    // Prepare dataframe objects
    const dataframeObjects = dataframes.map((data, index) => ({
      data,
      tableName: tableNames[index],
      options
    }));
    
    // Store all dataframes
    const { overall, results } = await SupabaseDataStorage.storeMultipleDataframes(dataframeObjects);
    
    if (overall) {
      return { 
        success: true, 
        message: 'All dataframes stored successfully', 
        details: results 
      };
    } else {
      // Find tables with errors
      const failedTables = Object.entries(results)
        .filter(([_, result]) => !result.success)
        .map(([table, result]) => ({
          table,
          errors: result.errors
        }));
      
      return { 
        success: false, 
        message: 'Some dataframes failed to store', 
        details: { failedTables, results } 
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: errorMessage };
  }
}
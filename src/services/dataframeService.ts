import { storeDataframesInSupabase } from '../utils/storeDataframes';
import { validateDataframe, csvToDataframe } from '../utils/dataframeUtils';
import { supabase } from '../lib/supabase';

/**
 * Service for handling dataframe operations with Supabase
 */
export class DataframeService {
  /**
   * Store a dataframe in Supabase with validation and error handling
   * 
   * @param dataframe The dataframe to store
   * @param tableName The table to store the dataframe in
   * @param options Storage options
   * @returns Result of the storage operation
   */
  static async storeDataframe(
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
    try {
      // Validate connection first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          success: false,
          message: 'Not authenticated. Please sign in to store data.',
          details: sessionError?.message
        };
      }
      
      // Store the dataframe
      return await storeDataframesInSupabase(
        { [tableName]: dataframe },
        {
          validateSchema: options.validateSchema,
          replaceExisting: options.replaceExisting,
          batchSize: options.batchSize,
          onProgress: options.onProgress ? (table, progress) => options.onProgress!(progress) : undefined
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Import a CSV file and store it in Supabase
   * 
   * @param file The CSV file to import
   * @param tableName The table to store the data in
   * @param options Import and storage options
   * @returns Result of the import and storage operation
   */
  static async importCsvAndStore(
    file: File,
    tableName: string,
    options: {
      delimiter?: string;
      hasHeader?: boolean;
      validateSchema?: boolean;
      expectedColumns?: string[];
      requiredColumns?: string[];
      batchSize?: number;
      replaceExisting?: boolean;
      onProgress?: (phase: 'parsing' | 'validating' | 'storing', progress: number) => void;
    } = {}
  ): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Report parsing phase
      if (options.onProgress) {
        options.onProgress('parsing', 0);
      }
      
      // Read the file
      const fileContent = await file.text();
      
      // Parse CSV to dataframe
      const dataframe = csvToDataframe(fileContent, {
        delimiter: options.delimiter,
        hasHeader: options.hasHeader,
        skipEmptyLines: true,
        trimValues: true
      });
      
      if (dataframe.length === 0) {
        return {
          success: false,
          message: 'CSV file is empty or could not be parsed'
        };
      }
      
      // Report validation phase
      if (options.onProgress) {
        options.onProgress('validating', 0);
      }
      
      // Validate dataframe if requested
      if (options.validateSchema && options.expectedColumns) {
        const { valid, errors } = validateDataframe(
          dataframe,
          options.expectedColumns,
          options.requiredColumns
        );
        
        if (!valid) {
          return {
            success: false,
            message: 'CSV validation failed',
            details: { errors }
          };
        }
      }
      
      if (options.onProgress) {
        options.onProgress('validating', 100);
      }
      
      // Store the dataframe
      const storeProgress = options.onProgress 
        ? (progress: number) => options.onProgress!('storing', progress)
        : undefined;
      
      return await this.storeDataframe(dataframe, tableName, {
        ...options,
        onProgress: storeProgress
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Get a list of available tables in the database
   * 
   * @returns List of table names
   */
  static async getAvailableTables(): Promise<{ tables: string[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_available_tables');
      
      if (error) {
        // If the RPC doesn't exist, fall back to a direct query
        if (error.code === 'PGRST301') {
          // This query requires additional permissions
          const { data: tablesData, error: tablesError } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');
          
          if (tablesError) {
            return { tables: [], error: tablesError.message };
          }
          
          return { tables: tablesData.map(t => t.tablename) };
        }
        
        return { tables: [], error: error.message };
      }
      
      return { tables: data || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { tables: [], error: errorMessage };
    }
  }
  
  /**
   * Get the schema of a table
   * 
   * @param tableName The table to get the schema for
   * @returns Table schema information
   */
  static async getTableSchema(tableName: string): Promise<{ 
    schema: { name: string; columns: { name: string; type: string; isNullable: boolean }[] } | null; 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_table_schema', { table_name: tableName });
      
      if (error) {
        return { schema: null, error: error.message };
      }
      
      return { schema: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { schema: null, error: errorMessage };
    }
  }
}
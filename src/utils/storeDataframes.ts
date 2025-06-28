import { storeDataframe, checkSupabaseReadiness } from './dataframeUtils';

/**
 * Main function to store dataframes in Supabase
 * 
 * This function handles the complete process of storing dataframes in Supabase,
 * including connection verification, schema validation, data type conversion,
 * batch processing, and error handling.
 * 
 * @param dataframes Object mapping table names to dataframes
 * @param options Configuration options for the storage process
 * @returns Detailed result of the storage operation
 */
export async function storeDataframesInSupabase(
  dataframes: Record<string, any[]>,
  options: {
    validateSchema?: boolean;
    replaceExisting?: boolean;
    batchSize?: number;
    onProgress?: (tableName: string, progress: number) => void;
    onComplete?: (results: Record<string, any>) => void;
    onError?: (error: string) => void;
  } = {}
): Promise<{
  success: boolean;
  message: string;
  results: Record<string, {
    success: boolean;
    rowsProcessed: number;
    errors: string[];
    tableInfo?: {
      name: string;
      rowCount: number;
    };
  }>;
}> {
  try {
    // Check if Supabase is ready
    const { ready, issues } = await checkSupabaseReadiness();
    if (!ready) {
      return {
        success: false,
        message: `Supabase connection is not ready: ${issues.join(', ')}`,
        results: {}
      };
    }
    
    // Validate input
    if (!dataframes || Object.keys(dataframes).length === 0) {
      return {
        success: false,
        message: 'No dataframes provided',
        results: {}
      };
    }
    
    // Process each dataframe
    const results: Record<string, any> = {};
    let overallSuccess = true;
    
    for (const [tableName, dataframe] of Object.entries(dataframes)) {
      try {
        // Create a progress handler for this table
        const progressHandler = options.onProgress 
          ? (progress: number) => options.onProgress!(tableName, progress)
          : undefined;
        
        // Store the dataframe
        const result = await storeDataframe(dataframe, tableName, {
          validateSchema: options.validateSchema,
          batchSize: options.batchSize,
          replaceExisting: options.replaceExisting,
          onProgress: progressHandler
        });
        
        results[tableName] = result;
        
        if (!result.success) {
          overallSuccess = false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results[tableName] = {
          success: false,
          message: errorMessage,
          rowsProcessed: 0,
          errors: [errorMessage]
        };
        overallSuccess = false;
        
        // Call error handler if provided
        if (options.onError) {
          options.onError(`Error processing table ${tableName}: ${errorMessage}`);
        }
      }
    }
    
    // Call complete handler if provided
    if (options.onComplete) {
      options.onComplete(results);
    }
    
    return {
      success: overallSuccess,
      message: overallSuccess 
        ? 'All dataframes stored successfully' 
        : 'Some dataframes failed to store',
      results
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Call error handler if provided
    if (options.onError) {
      options.onError(errorMessage);
    }
    
    return {
      success: false,
      message: errorMessage,
      results: {}
    };
  }
}

/**
 * Example usage function that demonstrates how to use the dataframe storage
 */
export async function storeExampleDataframes(): Promise<void> {
  // Sample dataframes
  const usersDataframe = [
    { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 40 }
  ];
  
  const productsDataframe = [
    { id: '101', name: 'Laptop', price: 1200, category: 'Electronics' },
    { id: '102', name: 'Desk Chair', price: 150, category: 'Furniture' },
    { id: '103', name: 'Coffee Mug', price: 15, category: 'Kitchen' }
  ];
  
  // Store the dataframes
  const result = await storeDataframesInSupabase(
    {
      'users': usersDataframe,
      'products': productsDataframe
    },
    {
      validateSchema: true,
      replaceExisting: false,
      batchSize: 100,
      onProgress: (tableName, progress) => {
        console.log(`Storing ${tableName}: ${progress.toFixed(0)}% complete`);
      },
      onComplete: (results) => {
        console.log('Storage operation completed:', results);
      },
      onError: (error) => {
        console.error('Storage operation failed:', error);
      }
    }
  );
  
  console.log('Final result:', result);
}
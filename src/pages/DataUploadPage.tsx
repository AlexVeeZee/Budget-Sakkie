import React, { useState, useEffect } from 'react';
import { DataframeUploader } from '../components/DataframeUploader';
import { DataframeService } from '../services/dataframeService';
import { Database, Table, FileSpreadsheet, Info, AlertTriangle } from 'lucide-react';

export const DataUploadPage: React.FC = () => {
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  useEffect(() => {
    const fetchTables = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { tables, error } = await DataframeService.getAvailableTables();
        
        if (error) {
          setError(error);
        } else {
          setAvailableTables(tables);
        }
      } catch (err) {
        setError('Failed to fetch available tables');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTables();
  }, []);
  
  const handleUploadComplete = (result: any) => {
    setUploadResult(result);
    
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('upload-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Database className="mr-3 h-8 w-8 text-blue-600" />
          Dataframe Upload
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Upload CSV files to store data in your Supabase database tables. The system will validate your data structure, 
          convert data types as needed, and process large files in batches.
        </p>
      </div>
      
      {/* Connection Status */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <p className="mt-2 text-sm text-red-700">
                Please check your Supabase connection and ensure you are authenticated.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Available Tables */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Table className="mr-2 h-5 w-5 text-blue-600" />
          Available Tables
        </h2>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : availableTables.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {availableTables.map(table => (
                <li key={table} className="px-6 py-4 flex items-center">
                  <FileSpreadsheet className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-gray-900 font-medium">{table}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No tables available or unable to fetch tables.</p>
          </div>
        )}
      </div>
      
      {/* Uploader */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5 text-blue-600" />
          Upload Dataframe
        </h2>
        
        <DataframeUploader 
          availableTables={availableTables}
          onUploadComplete={handleUploadComplete}
        />
      </div>
      
      {/* Upload Results */}
      {uploadResult && (
        <div id="upload-results" className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Info className="mr-2 h-5 w-5 text-blue-600" />
            Upload Results
          </h2>
          
          <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
            uploadResult.success ? 'border-green-500' : 'border-red-500'
          }`}>
            <h3 className={`text-lg font-medium ${
              uploadResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
            </h3>
            
            <p className="mt-2 text-gray-600">{uploadResult.message}</p>
            
            {uploadResult.details && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Details:</h4>
                
                {/* Results by table */}
                {uploadResult.results && Object.entries(uploadResult.results).map(([table, result]: [string, any]) => (
                  <div key={table} className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700">Table: {table}</h5>
                    
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.success ? 'Success' : 'Failed'}: {result.message}
                      </p>
                      
                      {result.rowsProcessed !== undefined && (
                        <p className="text-sm text-gray-600">
                          Rows processed: {result.rowsProcessed}
                        </p>
                      )}
                      
                      {result.errors && result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-700">Errors:</p>
                          <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                            {result.errors.slice(0, 5).map((error: string, i: number) => (
                              <li key={i}>{error}</li>
                            ))}
                            {result.errors.length > 5 && (
                              <li>...and {result.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">How to Use</h2>
        
        <ol className="list-decimal list-inside space-y-3 text-blue-700">
          <li>
            <span className="font-medium">Select a CSV file</span> to upload (must be properly formatted with consistent data types)
          </li>
          <li>
            <span className="font-medium">Choose a target table</span> from the dropdown or enter a custom table name
          </li>
          <li>
            <span className="font-medium">Configure CSV options</span> like delimiter and whether the file has a header row
          </li>
          <li>
            <span className="font-medium">Decide whether to replace existing data</span> or append to the table
          </li>
          <li>
            <span className="font-medium">Click "Upload to Supabase"</span> to start the process
          </li>
        </ol>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
            <li>Large files are processed in batches to prevent timeouts</li>
            <li>Data types are automatically converted to match the table schema</li>
            <li>Required columns must have values in all rows</li>
            <li>The system will validate your data structure before storing</li>
            <li>If "Replace existing data" is selected, all current data in the table will be deleted</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataUploadPage;
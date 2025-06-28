import React, { useState, useRef } from 'react';
import { Upload, Database, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { DataframeService } from '../services/dataframeService';

interface DataframeUploaderProps {
  onUploadComplete?: (result: { success: boolean; message: string; details?: any }) => void;
  availableTables?: string[];
  defaultTable?: string;
}

export const DataframeUploader: React.FC<DataframeUploaderProps> = ({
  onUploadComplete,
  availableTables = [],
  defaultTable = ''
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState(defaultTable);
  const [customTableName, setCustomTableName] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<'parsing' | 'validating' | 'storing'>('parsing');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    details?: any;
  }>({});
  const [availableTablesList, setAvailableTablesList] = useState<string[]>(availableTables);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch available tables if not provided
  React.useEffect(() => {
    if (availableTables.length === 0) {
      const fetchTables = async () => {
        const { tables, error } = await DataframeService.getAvailableTables();
        if (!error) {
          setAvailableTablesList(tables);
          if (tables.length > 0 && !defaultTable) {
            setTableName(tables[0]);
          }
        }
      };
      
      fetchTables();
    }
  }, [availableTables, defaultTable]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Reset result
      setResult({});
    }
  };
  
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTableName(value);
    
    // Reset custom table name if not "custom"
    if (value !== 'custom') {
      setCustomTableName('');
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setResult({
        success: false,
        message: 'Please select a file to upload'
      });
      return;
    }
    
    const targetTable = tableName === 'custom' ? customTableName : tableName;
    
    if (!targetTable) {
      setResult({
        success: false,
        message: 'Please select or enter a table name'
      });
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setResult({});
    
    try {
      const result = await DataframeService.importCsvAndStore(
        file,
        targetTable,
        {
          delimiter,
          hasHeader,
          replaceExisting,
          onProgress: (phase, phaseProgress) => {
            setUploadPhase(phase);
            setProgress(phaseProgress);
          }
        }
      );
      
      setResult(result);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setResult({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Database className="mr-2 h-5 w-5 text-blue-600" />
        Upload Dataframe to Supabase
      </h2>
      
      {/* File Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV File
        </label>
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isUploading}
          />
          {file && (
            <button
              onClick={resetForm}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              disabled={isUploading}
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>
      
      {/* Table Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Table
        </label>
        <select
          value={tableName}
          onChange={handleTableChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          disabled={isUploading}
        >
          <option value="">Select a table</option>
          {availableTablesList.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
          <option value="custom">Custom table name</option>
        </select>
        
        {tableName === 'custom' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Table Name
            </label>
            <input
              type="text"
              value={customTableName}
              onChange={(e) => setCustomTableName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter table name"
              disabled={isUploading}
            />
          </div>
        )}
      </div>
      
      {/* CSV Options */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-3">CSV Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delimiter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delimiter
            </label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={isUploading}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
          
          {/* Header Row */}
          <div className="flex items-center h-full pt-8">
            <input
              type="checkbox"
              id="hasHeader"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isUploading}
            />
            <label htmlFor="hasHeader" className="ml-2 block text-sm text-gray-700">
              File has header row
            </label>
          </div>
        </div>
      </div>
      
      {/* Storage Options */}
      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="replaceExisting"
            checked={replaceExisting}
            onChange={(e) => setReplaceExisting(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isUploading}
          />
          <label htmlFor="replaceExisting" className="ml-2 block text-sm text-gray-700">
            Replace existing data
          </label>
        </div>
        {replaceExisting && (
          <p className="mt-2 text-sm text-yellow-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Warning: This will delete all existing data in the table
          </p>
        )}
      </div>
      
      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || !tableName || isUploading || (tableName === 'custom' && !customTableName)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              {uploadPhase === 'parsing' && 'Parsing...'}
              {uploadPhase === 'validating' && 'Validating...'}
              {uploadPhase === 'storing' && 'Storing...'}
              {progress > 0 && ` (${Math.round(progress)}%)`}
            </>
          ) : (
            <>
              <Upload className="-ml-1 mr-2 h-4 w-4" />
              Upload to Supabase
            </>
          )}
        </button>
      </div>
      
      {/* Progress Bar */}
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">
            {uploadPhase === 'parsing' && 'Parsing CSV file...'}
            {uploadPhase === 'validating' && 'Validating data structure...'}
            {uploadPhase === 'storing' && `Storing data in Supabase... (${Math.round(progress)}%)`}
          </p>
        </div>
      )}
      
      {/* Result Message */}
      {result.success !== undefined && (
        <div className={`mt-6 p-4 rounded-md ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Success' : 'Error'}
              </h3>
              <p className={`mt-2 text-sm ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
              
              {/* Show details for errors */}
              {!result.success && result.details?.errors && (
                <div className="mt-2">
                  <details className="text-sm text-red-700">
                    <summary className="cursor-pointer font-medium">Show error details</summary>
                    <ul className="mt-2 list-disc list-inside">
                      {Array.isArray(result.details.errors) ? (
                        result.details.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))
                      ) : (
                        <li>{JSON.stringify(result.details.errors)}</li>
                      )}
                    </ul>
                  </details>
                </div>
              )}
              
              {/* Show success details */}
              {result.success && result.details && (
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Successfully stored data in <strong>{tableName === 'custom' ? customTableName : tableName}</strong>
                  </p>
                  {result.details.rowsProcessed && (
                    <p>Rows processed: {result.details.rowsProcessed}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
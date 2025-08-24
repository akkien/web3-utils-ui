"use client";

import { useState } from "react";
import { decodeErrorResult } from "viem";
import CopyComponent from "@/components/copy";

interface ErrorInput {
  name: string;
  type: string;
}

interface ABIError {
  inputs: ErrorInput[];
  name: string;
  type: string;
}

interface DecodedError {
  errorName: string;
  args: any;
  signature: string;
  formattedArgs: { name: string; value: string; type: string }[];
}

export default function ErrorDecode() {
  const [contractABI, setContractABI] = useState("");
  const [errorData, setErrorData] = useState("");
  const [decodedError, setDecodedError] = useState<DecodedError | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedABI, setParsedABI] = useState<ABIError[]>([]);

  const parseContractABI = (abiString: string): ABIError[] => {
    try {
      const abi = JSON.parse(abiString);

      if (!Array.isArray(abi)) {
        throw new Error("Contract ABI must be an array");
      }

      if (abi.length === 0) {
        throw new Error("Contract ABI array is empty");
      }

      // Filter only error definitions
      const errors = abi.filter((item: any) => item.type === "error") as ABIError[];

      if (errors.length === 0) {
        throw new Error("No errors found in the contract ABI");
      }

      // Ensure all errors have inputs array
      errors.forEach((err) => {
        if (!err.inputs) {
          err.inputs = [];
        }
      });

      return errors;
    } catch (err) {
      if (err instanceof Error && err.message.includes("No errors found")) {
        throw err;
      }
      throw new Error("Invalid JSON format for contract ABI");
    }
  };

  const handleDecode = async () => {
    if (!contractABI.trim()) {
      setError("Please enter a contract ABI");
      return;
    }

    if (!errorData.trim()) {
      setError("Please enter error data");
      return;
    }

    setIsLoading(true);
    setError("");
    setDecodedError(null);

    try {
      // Use viem to decode the error
      const decoded = decodeErrorResult({
        abi: parsedABI,
        data: errorData.trim() as `0x${string}`,
      });

      // Find the matching error in ABI for signature
      const errorDef = parsedABI.find((err) => err.name === decoded.errorName);
      const signature = errorDef
        ? `${errorDef.name}(${errorDef.inputs.map((input) => input.type).join(",")})`
        : decoded.errorName || "Unknown";

      // Format arguments for display
      const formattedArgs: { name: string; value: string; type: string }[] = [];

      if (errorDef && decoded.args) {
        // Convert decoded args object to array format
        const argsArray = Object.values(decoded.args);

        for (let i = 0; i < errorDef.inputs.length; i++) {
          const input = errorDef.inputs[i];
          const value = argsArray[i];

          // Format the value based on type
          let formattedValue: string;
          if (input.type.startsWith("uint") || input.type.startsWith("int")) {
            formattedValue = value?.toString() || "0";
          } else if (input.type === "bool") {
            formattedValue = value ? "true" : "false";
          } else if (input.type === "address") {
            formattedValue = value?.toString() || "0x0";
          } else if (input.type.startsWith("bytes")) {
            formattedValue = value?.toString() || "0x";
          } else if (Array.isArray(value)) {
            formattedValue = JSON.stringify(value);
          } else {
            formattedValue = value?.toString() || "";
          }

          formattedArgs.push({
            name: input.name || `arg${i}`,
            value: formattedValue,
            type: input.type,
          });
        }
      }

      setDecodedError({
        errorName: decoded.errorName || "Unknown",
        args: decoded.args,
        signature: signature,
        formattedArgs,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decode error");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setContractABI("");
    setErrorData("");
    setDecodedError(null);
    setParsedABI([]);
    setError("");
  };

  return (
    <div className='space-y-2'>
      <h2 className='text-2xl font-bold text-gray-900'>Error Decoder</h2>

      <div className='space-y-2'>
        {/* Contract ABI */}
        <div>
          <label htmlFor='contractABI' className='block text-sm font-medium text-gray-700 mb-2'>
            Contract ABI (JSON)
          </label>
          <textarea
            id='contractABI'
            value={contractABI}
            onChange={(e) => {
              setContractABI(e.target.value);
              // Auto-parse ABI to extract errors
              try {
                const errors = parseContractABI(e.target.value);
                setParsedABI(errors);
                setError("");
              } catch (err) {
                setParsedABI([]);
              }
            }}
            placeholder='[{"inputs":[{"name":"required","type":"uint256"},{"name":"available","type":"uint256"}],"name":"InsufficientBalance","type":"error"}, {"inputs":[{"name":"spender","type":"address"}],"name":"InvalidSpender","type":"error"}]'
            rows={4}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
          />
        </div>

        {/* Error Data */}
        <div>
          <label htmlFor='errorData' className='block text-sm font-medium text-gray-700 mb-2'>
            Error Data (Hex)
          </label>
          <textarea
            id='errorData'
            value={errorData}
            onChange={(e) => setErrorData(e.target.value)}
            placeholder='0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a4e6f7420656e6f7567682045746865722070726f76696465642e000000000000'
            rows={2}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
          />
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button
            onClick={handleDecode}
            disabled={isLoading || !contractABI.trim() || !errorData.trim()}
            className='px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            {isLoading ? "Decoding..." : "Decode Error"}
          </button>
          <button
            onClick={clearAll}
            className='px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'
          >
            Clear All
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
            <p className='text-red-600 text-sm font-medium'>Error: {error}</p>
          </div>
        )}

        {/* Decoded Error Results */}
        {decodedError && (
          <div className='space-y-4'>
            {/* Error Summary */}
            <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
              <h3 className='text-sm font-medium text-red-800 mb-3'>Error Summary</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center p-2 bg-white rounded border'>
                    <span className='text-sm font-medium text-gray-600'>Error Name:</span>
                    <div className='flex items-center space-x-2'>
                      <span className='font-mono text-sm text-red-700'>{decodedError.errorName}</span>
                      <CopyComponent textToCopy={decodedError.errorName} />
                    </div>
                  </div>
                  <div className='flex justify-between items-center p-2 bg-white rounded border'>
                    <span className='text-sm font-medium text-gray-600'>Arguments Count:</span>
                    <span className='font-mono text-sm text-red-700'>{decodedError.formattedArgs.length}</span>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='p-2 bg-white rounded border'>
                    <div className='text-sm font-medium text-gray-600 mb-1'>Error Signature:</div>
                    <div className='flex items-center space-x-2'>
                      <code className='font-mono text-sm text-red-700 break-all flex-1'>{decodedError.signature}</code>
                      <CopyComponent textToCopy={decodedError.signature} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formatted Decoded Arguments */}
            {decodedError.formattedArgs.length > 0 && (
              <div className='p-4 bg-orange-50 border border-orange-200 rounded-md'>
                <h3 className='text-sm font-medium text-orange-800 mb-3'>Decoded Arguments</h3>
                <div className='space-y-3'>
                  {decodedError.formattedArgs.map((arg, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-orange-200 rounded bg-white'
                    >
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Index</label>
                        <div className='text-sm text-gray-700'>{index}</div>
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Name</label>
                        <div className='text-sm text-gray-700'>{arg.name}</div>
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Type</label>
                        <div className='text-sm text-gray-700 font-mono'>{arg.type}</div>
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Value</label>
                        <div className='flex items-center space-x-2'>
                          <div className='font-mono text-sm text-gray-700 break-all flex-1'>{arg.value}</div>
                          <CopyComponent textToCopy={arg.value} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Decoded Arguments (Viem format) */}
            <div className='p-4 bg-purple-50 border border-purple-200 rounded-md'>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='text-sm font-medium text-purple-800'>Raw Decoded Arguments (Viem format)</h3>
                <CopyComponent textToCopy={JSON.stringify(decodedError.args, null, 2)} />
              </div>
              <pre className='font-mono text-sm text-purple-700 bg-white p-3 rounded border overflow-auto max-h-96'>
                {JSON.stringify(decodedError.args, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h3 className='text-sm font-medium text-blue-800 mb-2'>Usage Instructions</h3>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>• Enter the full contract ABI in JSON format (must include error definitions)</li>
          <li>• Provide the error data as a hex string (typically from a failed transaction)</li>
          <li>• Error will be automatically detected and decoded using viem</li>
          <li>• Shows both formatted arguments with types and raw viem decoded output</li>
          <li>• Common error patterns include custom errors and revert strings</li>
          <li>• Error data can be obtained from transaction receipts or call failures</li>
          <li>• The decoder handles both custom errors and standard Solidity errors</li>
        </ul>
      </div>
    </div>
  );
}

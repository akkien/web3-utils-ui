"use client";

import { useState } from "react";
import { type Abi, type AbiFunction, decodeFunctionData, toFunctionSelector } from "viem";

interface DecodedParameter {
  name: string;
  type: string;
  value: any;
}

interface DecodedFunction {
  name: string;
  signature: string;
  params: DecodedParameter[];
}

export const AbiDecoder = () => {
  const [abi, setAbi] = useState<string>("");
  const [functionData, setFunctionData] = useState<string>("");
  const [decodedFunction, setDecodedFunction] = useState<DecodedFunction | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAbiChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAbi(e.target.value);
    setDecodedFunction(null);
    setError("");
  };

  const handleFunctionDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFunctionData(e.target.value);
    setDecodedFunction(null);
    setError("");
  };

  const decodeFunction = () => {
    setLoading(true);
    setError("");
    setDecodedFunction(null);

    try {
      // Validate inputs
      if (!abi.trim()) {
        throw new Error("ABI is required");
      }

      if (!functionData.trim()) {
        throw new Error("Function data is required");
      }

      // Parse ABI using Viem
      const parsedAbi = JSON.parse(abi) as Abi;

      // Ensure data starts with 0x
      const data = functionData.startsWith("0x") ? functionData : `0x${functionData}`;

      // Get function selector (first 4 bytes/8 characters after 0x)
      const functionSelector = data.slice(0, 10);

      // Find the matching function in the ABI
      const abiFunctions = parsedAbi.filter((item) => item.type === "function") as AbiFunction[];

      // Find the function that matches our selector
      const matchedFunction = abiFunctions.find((func) => {
        const selector = toFunctionSelector(func);
        return selector === functionSelector;
      });

      if (!matchedFunction) {
        throw new Error(`No matching function found for selector: ${functionSelector}`);
      }

      // Decode the function data using Viem
      const decoded = decodeFunctionData({
        abi: parsedAbi,
        data: data as `0x${string}`,
      });

      // Format the decoded parameters
      const params: DecodedParameter[] = matchedFunction.inputs.map((input, index) => {
        const value = decoded.args?.[index];
        return {
          name: input.name || `param${index}`,
          type: input.type,
          value: formatValue(value, input.type),
        };
      });

      // Set the decoded function result
      setDecodedFunction({
        name: matchedFunction.name,
        signature: toFunctionSelector(matchedFunction),
        params,
      });
    } catch (err: any) {
      console.error("Error decoding function:", err);
      setError(err.message || "Failed to decode function data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format various types of values for display
  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) {
      return "null";
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return `[${value.map((v) => formatValue(v, type.replace(/\[\d*\]$/, ""))).join(", ")}]`;
    }

    // Handle BigInt values
    if (typeof value === "bigint") {
      return value.toString();
    }

    // Handle bytes and string
    if (typeof value === "string") {
      if (type.startsWith("bytes") && value.startsWith("0x")) {
        return value;
      }
      return `"${value}"`;
    }

    // Handle booleans and other types
    return String(value);
  };

  return (
    <div className='space-y-2'>
      <h2 className='text-2xl font-bold'>ABI Decoder</h2>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Contract ABI (JSON format)</label>
        <textarea
          value={abi}
          onChange={handleAbiChange}
          rows={4}
          className='w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500'
          placeholder='[{"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Function Data (hex)</label>
        <textarea
          value={functionData}
          onChange={handleFunctionDataChange}
          className='w-full h-20 p-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500'
          placeholder='0xa9059cbb000000000000000000000000e2e13fccd48644cc68ce9cd40ee4d9433f23f1f0000000000000000000000000000000000000000000000000000000000004e20'
        />
      </div>

      <div>
        <button
          onClick={decodeFunction}
          disabled={loading}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50'
        >
          {loading ? "Decoding..." : "Decode Function"}
        </button>
      </div>

      {error && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-600'>{error}</p>
        </div>
      )}

      {decodedFunction && (
        <div className='p-4 bg-gray-50 border border-gray-200 rounded-md'>
          <div className='mb-4'>
            <h3 className='text-lg font-semibold'>Decoded Function</h3>
            <p className='font-mono text-sm'>{decodedFunction.signature}</p>
          </div>

          <div>
            <h4 className='text-md font-medium mb-2'>Parameters</h4>
            {decodedFunction.params.length > 0 ? (
              <ul className='space-y-2'>
                {decodedFunction.params.map((param, index) => (
                  <li key={index} className='border-b border-gray-200 pb-2'>
                    <div className='flex flex-wrap items-baseline'>
                      <span className='w-1/4 font-semibold text-sm'>{param.name}</span>
                      <span className='w-1/4 text-gray-600 text-xs'>{param.type}</span>
                      <span className='w-2/4 font-mono text-sm break-all'>{param.value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-gray-500'>No parameters</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AbiDecoder;

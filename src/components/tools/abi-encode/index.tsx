"use client";

import { useState } from "react";
import { ethers } from "ethers";

interface Parameter {
  name: string;
  value: string;
}

interface ABIInput {
  name: string;
  type: string;
}

interface ABIFunction {
  inputs: ABIInput[];
  name: string;
  outputs?: any[];
  stateMutability?: string;
  type: string;
}

export default function AbiEncode() {
  const [functionName, setFunctionName] = useState("");
  const [abiSignature, setAbiSignature] = useState("");
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [encodedData, setEncodedData] = useState("");
  const [functionSelector, setFunctionSelector] = useState("");
  const [functionSignature, setFunctionSignature] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedABI, setParsedABI] = useState<ABIFunction | null>(null);

  const updateParameter = (index: number, field: keyof Parameter, value: string) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

  const parseABISignature = (abiString: string): ABIFunction => {
    try {
      const abi = JSON.parse(abiString);

      // Handle both single function object and array format
      let functionDef: ABIFunction;
      if (Array.isArray(abi)) {
        if (abi.length === 0) {
          throw new Error("ABI array is empty");
        }
        functionDef = abi[0] as ABIFunction;
      } else {
        functionDef = abi as ABIFunction;
      }

      if (functionDef.type !== "function") {
        throw new Error("ABI must be a function definition");
      }

      if (!functionDef.inputs) {
        functionDef.inputs = [];
      }

      return functionDef;
    } catch (err) {
      throw new Error("Invalid JSON format for ABI signature");
    }
  };

  const handleEncode = async () => {
    if (!functionName.trim()) {
      setError("Please enter a function name");
      return;
    }

    if (!abiSignature.trim()) {
      setError("Please enter an ABI signature");
      return;
    }

    setIsLoading(true);
    setError("");
    setEncodedData("");
    setFunctionSelector("");
    setFunctionSignature("");

    try {
      // Parse ABI signature
      const functionDef = parseABISignature(abiSignature);
      setParsedABI(functionDef);

      // Validate function name matches
      if (functionDef.name !== functionName) {
        throw new Error(`Function name "${functionName}" does not match ABI function name "${functionDef.name}"`);
      }

      // Build function signature from ABI
      const paramTypes = functionDef.inputs.map((input) => input.type);
      const signature = `${functionName}(${paramTypes.join(",")})`;
      setFunctionSignature(signature);

      // Create function fragment
      const functionFragment = ethers.FunctionFragment.from(signature);

      // Get function selector (first 4 bytes of keccak256 hash)
      const selector = ethers.id(signature).slice(0, 10);
      setFunctionSelector(selector);

      // Validate parameter count
      if (parameters.length !== functionDef.inputs.length) {
        throw new Error(`Expected ${functionDef.inputs.length} parameters, but got ${parameters.length}`);
      }

      // Parse and validate parameter values
      const values: any[] = [];
      for (let i = 0; i < functionDef.inputs.length; i++) {
        const input = functionDef.inputs[i];
        const param = parameters[i];

        if (!param || !param.value.trim()) {
          throw new Error(`Parameter "${input.name}" (${input.type}) cannot be empty`);
        }

        try {
          const parsedValue = parseParameterValue(input.type, param.value);
          values.push(parsedValue);
        } catch (err) {
          throw new Error(`Invalid value for parameter "${input.name}" (${input.type}): ${err}`);
        }
      }

      // Create interface and encode function data
      const iface = new ethers.Interface([functionFragment]);
      const encoded = iface.encodeFunctionData(functionFragment, values);
      setEncodedData(encoded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to encode function data");
    } finally {
      setIsLoading(false);
    }
  };

  const parseParameterValue = (type: string, value: string): any => {
    if (!value.trim()) {
      throw new Error("Value cannot be empty");
    }

    // Handle arrays
    if (type.includes("[]")) {
      try {
        const arrayValues = JSON.parse(value);
        if (!Array.isArray(arrayValues)) {
          throw new Error("Array values must be in JSON array format");
        }
        const baseType = type.replace("[]", "");
        return arrayValues.map((v) => parseParameterValue(baseType, String(v)));
      } catch (err) {
        throw new Error('Invalid array format. Use JSON array syntax: ["value1", "value2"]');
      }
    }

    // Handle different types
    if (type.startsWith("uint") || type.startsWith("int")) {
      const num = ethers.getBigInt(value);
      return num;
    } else if (type === "bool") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
      throw new Error("Boolean value must be 'true' or 'false'");
    } else if (type === "address") {
      if (!ethers.isAddress(value)) {
        throw new Error("Invalid Ethereum address");
      }
      return value;
    } else if (type.startsWith("bytes")) {
      if (!ethers.isHexString(value)) {
        throw new Error("Bytes value must be a valid hex string");
      }
      return value;
    } else if (type === "string") {
      return value;
    } else {
      // For other types, try to parse as-is
      return value;
    }
  };

  const clearAll = () => {
    setFunctionName("");
    setAbiSignature("");
    setParameters([]);
    setEncodedData("");
    setFunctionSelector("");
    setFunctionSignature("");
    setParsedABI(null);
    setError("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>ABI Encoder</h2>

        <div className='space-y-2'>
          {/* ABI Signature */}
          <div>
            <label htmlFor='abiSignature' className='block text-sm font-medium text-gray-700 mb-2'>
              ABI Function Signature (JSON)
            </label>
            <textarea
              id='abiSignature'
              value={abiSignature}
              onChange={(e) => {
                setAbiSignature(e.target.value);
                // Auto-parse ABI to generate parameter fields
                try {
                  const functionDef = parseABISignature(e.target.value);
                  setParsedABI(functionDef);
                  const newParams = functionDef.inputs.map((input) => ({
                    name: input.name,
                    value: "",
                  }));
                  setParameters(newParams);
                  setError("");
                } catch (err) {
                  // Don't show error while typing, only on encode
                  setParsedABI(null);
                }
              }}
              placeholder='[{"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]'
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
            />
          </div>

          {/* Function Name */}
          <div>
            <label htmlFor='functionName' className='block text-sm font-medium text-gray-700 mb-2'>
              Function Name
            </label>
            <input
              type='text'
              id='functionName'
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              placeholder='e.g., transfer, approve, balanceOf'
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          {/* Parameters - Auto-generated from ABI */}
          {parsedABI && parsedABI.inputs.length > 0 && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                Parameters ({parsedABI.inputs.length} required)
              </label>

              <div className='space-y-3'>
                {parsedABI.inputs.map((input, index) => (
                  <div
                    key={index}
                    className='grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-gray-200 rounded-md bg-gray-50'
                  >
                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1'>Parameter Name</label>
                      <input
                        type='text'
                        value={input.name || `param${index}`}
                        readOnly
                        className='w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 text-gray-600'
                      />
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1'>Type</label>
                      <input
                        type='text'
                        value={input.type}
                        readOnly
                        className='w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 text-gray-600'
                      />
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1'>Value</label>
                      <input
                        type='text'
                        value={parameters[index]?.value || ""}
                        onChange={(e) => updateParameter(index, "value", e.target.value)}
                        placeholder={getPlaceholder(input.type)}
                        className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <button
              onClick={handleEncode}
              disabled={isLoading || !functionName.trim() || !abiSignature.trim()}
              className='px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? "Encoding..." : "Encode Function Data"}
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

          {/* Results */}
          {functionSignature && (
            <div className='space-y-4'>
              {/* Function Signature */}
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-medium text-blue-800'>Function Signature</h3>
                  <button
                    onClick={() => copyToClipboard(functionSignature)}
                    className='text-xs text-blue-600 hover:text-blue-800 underline'
                  >
                    Copy
                  </button>
                </div>
                <div className='font-mono text-sm text-blue-700 break-all'>{functionSignature}</div>
              </div>

              {/* Function Selector */}
              <div className='p-4 bg-purple-50 border border-purple-200 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-medium text-purple-800'>Function Selector (4 bytes)</h3>
                  <button
                    onClick={() => copyToClipboard(functionSelector)}
                    className='text-xs text-purple-600 hover:text-purple-800 underline'
                  >
                    Copy
                  </button>
                </div>
                <div className='font-mono text-sm text-purple-700 break-all'>{functionSelector}</div>
              </div>

              {/* Encoded Data */}
              {encodedData && (
                <div className='p-4 bg-green-50 border border-green-200 rounded-md'>
                  <div className='flex justify-between items-center mb-2'>
                    <h3 className='text-sm font-medium text-green-800'>Encoded Function Data</h3>
                    <button
                      onClick={() => copyToClipboard(encodedData)}
                      className='text-xs text-green-600 hover:text-green-800 underline'
                    >
                      Copy
                    </button>
                  </div>
                  <div className='font-mono text-sm text-green-700 break-all'>{encodedData}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
          <h3 className='text-sm font-medium text-blue-800 mb-2'>Usage Instructions</h3>
          <ul className='text-sm text-blue-700 space-y-1'>
            <li>• Enter the function name and paste the complete ABI function definition</li>
            <li>• The ABI should be in JSON format with inputs, name, type, etc.</li>
            <li>• Parameters will be auto-generated from the ABI inputs</li>
            <li>• For arrays, use JSON format: [&quot;value1&quot;, &quot;value2&quot;] or [123, 456]</li>
            <li>• Addresses must be valid Ethereum addresses (42 characters starting with 0x)</li>
            <li>• The encoded data can be used directly in Ethereum transactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function getPlaceholder(type: string): string {
  if (type.includes("[]")) {
    const baseType = type.replace("[]", "");
    if (baseType === "uint256" || baseType.startsWith("uint") || baseType.startsWith("int")) {
      return "[123, 456]";
    } else if (baseType === "address") {
      return '["0x123...", "0x456..."]';
    } else if (baseType === "string") {
      return '["hello", "world"]';
    } else {
      return '["value1", "value2"]';
    }
  }

  switch (type) {
    case "address":
      return "0x742d35Cc6634C0532925a3b8D6E4CE";
    case "bool":
      return "true";
    case "string":
      return "Hello World";
    case "bytes":
    case "bytes32":
    case "bytes20":
    case "bytes16":
    case "bytes8":
    case "bytes4":
      return "0x1234567890abcdef";
    default:
      if (type.startsWith("uint") || type.startsWith("int")) {
        return "1000000000000000000";
      }
      return "value";
  }
}

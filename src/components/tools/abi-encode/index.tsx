"use client";

import { useState } from "react";
import { ethers } from "ethers";
import CopyComponent from "@/components/copy";

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
  const [contractABI, setContractABI] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [jsonParameters, setJsonParameters] = useState("");
  const [useJsonInput, setUseJsonInput] = useState(false);
  const [encodedData, setEncodedData] = useState("");
  const [functionSelector, setFunctionSelector] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedABI, setParsedABI] = useState<ABIFunction[]>([]);
  const [selectedFunctionDef, setSelectedFunctionDef] = useState<ABIFunction | null>(null);

  const updateParameter = (index: number, field: keyof Parameter, value: string) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

  const parseABISignature = (abiString: string): ABIFunction[] => {
    try {
      const abi = JSON.parse(abiString);

      if (!Array.isArray(abi)) {
        throw new Error("Contract ABI must be an array");
      }

      if (abi.length === 0) {
        throw new Error("Contract ABI array is empty");
      }

      // Filter only function definitions
      const functions = abi.filter((item: any) => item.type === "function") as ABIFunction[];

      if (functions.length === 0) {
        throw new Error("No functions found in the contract ABI");
      }

      // Ensure all functions have inputs array
      functions.forEach((func) => {
        if (!func.inputs) {
          func.inputs = [];
        }
      });

      return functions;
    } catch (err) {
      if (err instanceof Error && err.message.includes("No functions found")) {
        throw err;
      }
      throw new Error("Invalid JSON format for contract ABI");
    }
  };

  const handleEncode = async () => {
    if (!selectedFunction.trim()) {
      setError("Please select a function");
      return;
    }

    if (!contractABI.trim()) {
      setError("Please enter a contract ABI");
      return;
    }

    if (!selectedFunctionDef) {
      setError("Selected function not found in ABI");
      return;
    }

    setIsLoading(true);
    setError("");
    setEncodedData("");
    setFunctionSelector("");

    try {
      const functionDef = selectedFunctionDef;

      // Build function signature from ABI
      const paramTypes = functionDef.inputs.map((input) => input.type);
      const signature = `${functionDef.name}(${paramTypes.join(",")})`;

      // Create function fragment
      const functionFragment = ethers.FunctionFragment.from(signature);

      // Get function selector (first 4 bytes of keccak256 hash)
      const selector = ethers.id(signature).slice(0, 10);
      setFunctionSelector(selector);

      // Parse parameter values based on input method
      const values: any[] = [];

      if (useJsonInput) {
        // Parse JSON parameters
        if (jsonParameters.trim()) {
          try {
            const jsonValues = JSON.parse(jsonParameters);
            if (!Array.isArray(jsonValues)) {
              throw new Error("JSON parameters must be an array");
            }

            if (jsonValues.length !== functionDef.inputs.length) {
              throw new Error(`Expected ${functionDef.inputs.length} parameters, but got ${jsonValues.length}`);
            }

            // Validate and parse each value according to its type
            for (let i = 0; i < functionDef.inputs.length; i++) {
              const input = functionDef.inputs[i];
              const value = jsonValues[i];

              try {
                const parsedValue = parseParameterValue(input.type, String(value));
                values.push(parsedValue);
              } catch (err) {
                throw new Error(`Invalid value for parameter "${input.name}" (${input.type}): ${err}`);
              }
            }
          } catch (err) {
            if (err instanceof SyntaxError) {
              throw new Error("Invalid JSON format for parameters");
            }
            throw err;
          }
        } else {
          throw new Error("Please enter JSON parameters");
        }
      } else {
        // Use individual parameter fields
        if (parameters.length !== functionDef.inputs.length) {
          throw new Error(`Expected ${functionDef.inputs.length} parameters, but got ${parameters.length}`);
        }

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
    setContractABI("");
    setSelectedFunction("");
    setParameters([]);
    setJsonParameters("");
    setEncodedData("");
    setFunctionSelector("");
    setParsedABI([]);
    setSelectedFunctionDef(null);
    setError("");
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>ABI Encoder</h2>

      <div className='space-y-2'>
        {/* Contract ABI */}
        <div>
          <label htmlFor='contractABI' className='block text-sm font-medium text-gray-700 mb-2'>
            Contract ABI (JSON Array)
          </label>
          <textarea
            id='contractABI'
            value={contractABI}
            onChange={(e) => {
              setContractABI(e.target.value);
              // Auto-parse ABI to extract functions
              try {
                const functions = parseABISignature(e.target.value);
                setParsedABI(functions);
                setError("");
                // Reset selected function when ABI changes
                setSelectedFunction("");
                setSelectedFunctionDef(null);
                setParameters([]);
                setFunctionSelector("");
              } catch (err) {
                // Don't show error while typing, only on encode
                setParsedABI([]);
                setSelectedFunction("");
                setSelectedFunctionDef(null);
                setFunctionSelector("");
              }
            }}
            placeholder='[{"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]'
            rows={6}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
          />
        </div>

        {/* Function Selection */}
        {parsedABI.length > 0 && (
          <div className='flex flex-col md:flex-row flex-gap-4 justify-between items-center space-y-2 md:space-y-0 md:space-x-4'>
            <div className='w-full md:w-1/2'>
              <label htmlFor='selectedFunction' className='block text-sm font-medium text-gray-700 mb-2'>
                Select Function
              </label>
              <select
                id='selectedFunction'
                value={selectedFunction}
                onChange={(e) => {
                  setSelectedFunction(e.target.value);
                  const functionDef = parsedABI.find((f) => f.name === e.target.value);
                  setSelectedFunctionDef(functionDef || null);

                  if (functionDef) {
                    // Generate parameters
                    const newParams = functionDef.inputs.map((input) => ({
                      name: input.name,
                      value: "",
                    }));
                    setParameters(newParams);

                    // Generate function selector
                    try {
                      const paramTypes = functionDef.inputs.map((input) => input.type);
                      const signature = `${functionDef.name}(${paramTypes.join(",")})`;
                      const selector = ethers.id(signature).slice(0, 10);
                      setFunctionSelector(selector);
                    } catch (err) {
                      setFunctionSelector("");
                    }
                  } else {
                    setParameters([]);
                    setFunctionSelector("");
                  }
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select a function...</option>
                {parsedABI.map((func) => (
                  <option key={func.name} value={func.name}>
                    {func.name}({func.inputs.map((input) => input.type).join(", ")})
                  </option>
                ))}
              </select>
            </div>

            {/* Function Selector - Show immediately when function is selected */}
            <div className='w-full md:w-1/2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Function Selector</label>
              <div className='flex items-center space-x-2'>
                <div className='flex-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-md font-mono text-sm text-purple-700 flex items-center justify-between'>
                  <span>
                    {functionSelector ? (
                      functionSelector
                    ) : (
                      <span className='text-gray-500'>Select a function first</span>
                    )}
                  </span>
                  {functionSelector && <CopyComponent textToCopy={functionSelector} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parameters - Auto-generated from selected function */}
        {selectedFunctionDef && selectedFunctionDef.inputs.length > 0 && (
          <div>
            <div className='flex gap-2 mt-4 mb-2'>
              <button
                onClick={() => setUseJsonInput(false)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  !useJsonInput ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Individual Fields
              </button>
              <button
                onClick={() => setUseJsonInput(true)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  useJsonInput ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                JSON Input
              </button>
            </div>

            {useJsonInput ? (
              // JSON Parameter Input
              <div>
                <label htmlFor='jsonParameters' className='block text-xs font-medium text-gray-600 mb-2'>
                  Parameters as JSON Array
                </label>
                <textarea
                  id='jsonParameters'
                  value={jsonParameters}
                  onChange={(e) => setJsonParameters(e.target.value)}
                  placeholder={getJsonPlaceholder(selectedFunctionDef.inputs)}
                  rows={2}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
                />
              </div>
            ) : (
              // Individual Parameter Fields
              <div className='space-y-3'>
                {selectedFunctionDef.inputs.map((input, index) => (
                  <div key={index} className='grid grid-cols-1 md:grid-cols-3 gap-3 rounded-md'>
                    <div>
                      <input
                        type='text'
                        value={input.name || `param${index}`}
                        readOnly
                        className='w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 text-gray-600'
                      />
                    </div>

                    <div>
                      <input
                        type='text'
                        value={input.type}
                        readOnly
                        className='w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 text-gray-600'
                      />
                    </div>

                    <div>
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
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button
            onClick={handleEncode}
            disabled={isLoading || !selectedFunction.trim() || !contractABI.trim()}
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

        {/* Encoded Data */}
        {encodedData && (
          <div className='p-2 bg-green-50 border border-green-200 rounded-md'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='text-sm font-medium text-green-800'>Encoded Function Data</h3>
              <CopyComponent textToCopy={encodedData} />
            </div>
            <div className='font-mono text-sm text-green-700 break-all'>{encodedData}</div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h3 className='text-sm font-medium text-blue-800 mb-2'>Usage Instructions</h3>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>• Enter the complete contract ABI as a JSON array</li>
          <li>• The ABI should contain multiple function definitions with inputs, name, type, etc.</li>
          <li>• Select the function you want to encode from the dropdown list</li>
          <li>• Parameters will be auto-generated from the selected function&apos;s inputs</li>
          <li>
            • Choose between <strong>Individual Fields</strong> or <strong>JSON Input</strong> for entering parameter
            values
          </li>
          <li>• For JSON input: Enter values as an array in the same order as function parameters</li>
          <li>• For arrays, use JSON format: [&quot;value1&quot;, &quot;value2&quot;] or [123, 456]</li>
          <li>• Addresses must be valid Ethereum addresses (42 characters starting with 0x)</li>
          <li>• The encoded data can be used directly in Ethereum transactions</li>
        </ul>
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

function getJsonPlaceholder(inputs: ABIInput[]): string {
  const examples = inputs.map((input) => {
    if (input.type.includes("[]")) {
      const baseType = input.type.replace("[]", "");
      if (baseType === "uint256" || baseType.startsWith("uint") || baseType.startsWith("int")) {
        return "[123, 456]";
      } else if (baseType === "address") {
        return '["0x742d35Cc6634C0532925a3b8D6E4CE", "0x456..."]';
      } else if (baseType === "string") {
        return '["hello", "world"]';
      } else {
        return '["value1", "value2"]';
      }
    }

    switch (input.type) {
      case "address":
        return '"0x742d35Cc6634C0532925a3b8D6E4CE"';
      case "bool":
        return "true";
      case "string":
        return '"Hello World"';
      case "bytes":
      case "bytes32":
      case "bytes20":
      case "bytes16":
      case "bytes8":
      case "bytes4":
        return '"0x1234567890abcdef"';
      default:
        if (input.type.startsWith("uint") || input.type.startsWith("int")) {
          return '"1000000000000000000"';
        }
        return '"value"';
    }
  });

  return `[${examples.join(", ")}]`;
}

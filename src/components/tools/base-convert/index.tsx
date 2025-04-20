"use client";

import { useState, useEffect } from "react";

interface ConversionResult {
  decimal: string;
  hex: string;
  binary: string;
}

export const BaseConverter = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [detectedBase, setDetectedBase] = useState<string>("");
  const [conversionResults, setConversionResults] = useState<ConversionResult>({
    decimal: "",
    hex: "",
    binary: "",
  });
  const [error, setError] = useState<string>("");

  // Detect the base of the input and convert to other bases
  useEffect(() => {
    if (!inputValue.trim()) {
      setDetectedBase("");
      setConversionResults({ decimal: "", hex: "", binary: "" });
      setError("");
      return;
    }

    try {
      let baseValue: number;
      let base: string;

      // Detect binary (all 0s and 1s)
      if (/^[01]+$/.test(inputValue)) {
        baseValue = parseInt(inputValue, 2);
        base = "binary";
      }
      // Detect hexadecimal (starts with 0x or contains only hex digits)
      else if (/^0x[0-9a-fA-F]+$/.test(inputValue) || /^[0-9a-fA-F]+$/.test(inputValue)) {
        const hexValue = inputValue.startsWith("0x") ? inputValue.slice(2) : inputValue;
        baseValue = parseInt(hexValue, 16);
        base = "hexadecimal";
      }
      // Detect decimal (only contains digits)
      else if (/^[0-9]+$/.test(inputValue)) {
        baseValue = parseInt(inputValue, 10);
        base = "decimal";
      } else {
        throw new Error("Could not detect base. Input must be binary, decimal, or hexadecimal.");
      }

      setDetectedBase(base);
      setError("");

      // Convert to all bases
      setConversionResults({
        decimal: baseValue.toString(10),
        hex: "0x" + baseValue.toString(16).toLowerCase(),
        binary: baseValue.toString(2),
      });
    } catch (err: any) {
      setError(err.message || "Invalid input");
      setConversionResults({ decimal: "", hex: "", binary: "" });
      setDetectedBase("");
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCopyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <>
      <h2 className='text-2xl font-bold mb-6'>Number Base Converter</h2>

      <div className='mb-6'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>
          Enter a number (binary, decimal, or hexadecimal):
        </label>
        <input
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Enter a number (e.g., 42, 0x2A, 101010)'
        />
        {detectedBase && (
          <p className='mt-2 text-sm text-gray-600'>
            Detected base: <span className='font-semibold'>{detectedBase}</span>
          </p>
        )}
        {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
      </div>

      {(conversionResults.decimal || conversionResults.hex || conversionResults.binary) && (
        <div>
          <div className='flex justify-between items-center p-1 bg-gray-50 rounded-md'>
            <div>
              <span className='text-gray-500 text-sm'>Decimal:</span>
              <p className='font-mono text-sm'>{conversionResults.decimal}</p>
            </div>
            <button
              onClick={() => handleCopyToClipboard(conversionResults.decimal)}
              className='px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded'
            >
              Copy
            </button>
          </div>

          <div className='flex justify-between items-center p-1 bg-gray-50 rounded-md'>
            <div>
              <span className='text-gray-500 text-sm'>Hexadecimal:</span>
              <p className='font-mono text-sm'>{conversionResults.hex}</p>
            </div>
            <button
              onClick={() => handleCopyToClipboard(conversionResults.hex)}
              className='px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded'
            >
              Copy
            </button>
          </div>

          <div className='flex justify-between items-center p-1 bg-gray-50 rounded-md'>
            <div>
              <span className='text-gray-500 text-sm'>Binary:</span>
              <p className='font-mono text-sm break-all'>{conversionResults.binary}</p>
            </div>
            <button
              onClick={() => handleCopyToClipboard(conversionResults.binary)}
              className='px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded'
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BaseConverter;

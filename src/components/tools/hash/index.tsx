"use client";

import { useState } from "react";
import { sha256, keccak256 } from "viem";
import CopyComponent from "../../copy";

type InputFormat = "utf8" | "hex" | "ascii";

interface HashResult {
  sha256: string;
  keccak256: string;
}

export const HashGenerator = () => {
  const [inputText, setInputText] = useState<string>("");
  const [inputFormat, setInputFormat] = useState<InputFormat>("utf8");
  const [hashResults, setHashResults] = useState<HashResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setError("");
    setHashResults(null);
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputFormat(e.target.value as InputFormat);
    setError("");
    setHashResults(null);
  };

  const convertInputToBytes = (text: string, format: InputFormat): Uint8Array => {
    try {
      switch (format) {
        case "utf8":
          return new TextEncoder().encode(text);

        case "hex":
          // Remove 0x prefix if present
          const hexString = text.startsWith("0x") ? text.slice(2) : text;
          // Validate hex string
          if (!/^[0-9a-fA-F]*$/.test(hexString)) {
            throw new Error("Invalid hex string. Must contain only 0-9, A-F characters.");
          }
          // Ensure even length
          const paddedHex = hexString.length % 2 === 0 ? hexString : "0" + hexString;
          const bytes = new Uint8Array(paddedHex.length / 2);
          for (let i = 0; i < paddedHex.length; i += 2) {
            bytes[i / 2] = parseInt(paddedHex.substr(i, 2), 16);
          }
          return bytes;

        case "ascii":
          // Convert ASCII to bytes
          const asciiBytes = new Uint8Array(text.length);
          for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            if (charCode > 127) {
              throw new Error("Invalid ASCII character. ASCII characters must be in range 0-127.");
            }
            asciiBytes[i] = charCode;
          }
          return asciiBytes;

        default:
          throw new Error("Unsupported input format");
      }
    } catch (err: any) {
      throw new Error(`Failed to convert ${format} input: ${err.message}`);
    }
  };

  const generateHashes = () => {
    if (!inputText.trim()) {
      setError("Input text is required");
      return;
    }

    try {
      // Convert input to bytes based on selected format
      const inputBytes = convertInputToBytes(inputText, inputFormat);

      // Generate both hashes
      const sha256Hash = sha256(inputBytes);
      const keccak256Hash = keccak256(inputBytes);

      setHashResults({
        sha256: sha256Hash,
        keccak256: keccak256Hash,
      });
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to generate hash");
      setHashResults(null);
    }
  };

  const getPlaceholder = () => {
    switch (inputFormat) {
      case "utf8":
        return "Enter UTF-8 text (e.g., Hello World!)";
      case "hex":
        return "Enter hex string (e.g., 0x48656c6c6f or 48656c6c6f)";
      case "ascii":
        return "Enter ASCII text (e.g., Hello World)";
      default:
        return "Enter text to hash";
    }
  };

  return (
    <div className='space-y-2'>
      <h2 className='text-2xl font-bold'>Hash Generator</h2>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Input Text:</label>
        <div className='flex justify-between items-center mb-2 space-x-4'>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            className='flex-1 h-18 p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
            placeholder={getPlaceholder()}
          />
          <select
            value={inputFormat}
            onChange={handleFormatChange}
            className='flex-none h-18 w-36 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='utf8'>UTF-8</option>
            <option value='hex'>Hexadecimal</option>
            <option value='ascii'>ASCII</option>
          </select>
        </div>
      </div>

      <div>
        <button
          onClick={generateHashes}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
        >
          Generate Hash
        </button>
      </div>

      {error && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-600'>{error}</p>
        </div>
      )}

      {hashResults && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Hash Results</h3>

          <div className={`flex justify-between items-center p-2 rounded-md bg-gray-50`}>
            <div className='flex-1'>
              <span className='text-gray-500 text-sm block mb-1'>SHA256:</span>
              <p className='font-mono text-sm break-all'>{hashResults.sha256}</p>
            </div>
            <CopyComponent textToCopy={hashResults.sha256} />
          </div>

          <div className={`flex justify-between items-center p-2 rounded-md bg-gray-50`}>
            <div className='flex-1'>
              <span className='text-gray-500 text-sm block mb-1'>Keccak256:</span>
              <p className='font-mono text-sm break-all'>{hashResults.keccak256}</p>
            </div>
            <CopyComponent textToCopy={hashResults.keccak256} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HashGenerator;

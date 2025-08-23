"use client";

import { useState } from "react";
import { ethers } from "ethers";
import CopyComponent from "@/components/copy";

type InputType = "private-key" | "mnemonic" | "random";

export default function AddressGenerate() {
  const [inputType, setInputType] = useState<InputType>("random");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [accountPath, setAccountPath] = useState("m/44'/60'/0'/0/0");
  const [result, setResult] = useState<{
    privateKey: string;
    publicKey: string;
    address: string;
    mnemonic?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      let wallet: ethers.Wallet | ethers.HDNodeWallet;
      let mnemonic: string | undefined;
      let privateKey: string;

      switch (inputType) {
        case "private-key":
          if (!privateKeyInput.trim()) {
            throw new Error("Please enter a private key");
          }

          // Ensure private key starts with 0x
          const formattedPrivateKey = privateKeyInput.startsWith("0x") ? privateKeyInput : `0x${privateKeyInput}`;

          // Validate private key format
          if (!ethers.isHexString(formattedPrivateKey, 32)) {
            throw new Error("Invalid private key format. Must be 64 hex characters (with or without 0x prefix)");
          }

          wallet = new ethers.Wallet(formattedPrivateKey);
          privateKey = wallet.privateKey;
          break;

        case "mnemonic":
          console.log("Derivation Path:", accountPath);
          console.log("Mnemonic Input:", mnemonicInput);
          if (!mnemonicInput.trim()) {
            throw new Error("Please enter a mnemonic phrase");
          }

          wallet = ethers.HDNodeWallet.fromPhrase(mnemonicInput, "", accountPath);
          mnemonic = mnemonicInput;
          privateKey = wallet.privateKey;
          break;

        case "random":
          // Generate random wallet with mnemonic
          const randomWallet = ethers.Wallet.createRandom();
          wallet = randomWallet;
          mnemonic = randomWallet.mnemonic!.phrase;
          privateKey = wallet.privateKey;
          break;

        default:
          throw new Error("Invalid input type");
      }

      // Get public key from the wallet (works for both Wallet and HDNodeWallet)
      const publicKey = wallet instanceof ethers.HDNodeWallet ? wallet.publicKey : wallet.signingKey.publicKey;

      setResult({
        privateKey,
        publicKey,
        address: wallet.address,
        mnemonic,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate address");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setPrivateKeyInput("");
    setMnemonicInput("");
    setAccountPath("m/44'/60'/0'/0/0");
    setResult(null);
    setError("");
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>Address Generator</h2>

        <div className='space-y-2'>
          {/* Input Type Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>Generation Method</label>
            <div className='flex flex-wrap gap-3'>
              <button
                onClick={() => setInputType("random")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  inputType === "random"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                }`}
              >
                Generate Random
              </button>
              <button
                onClick={() => setInputType("private-key")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  inputType === "private-key"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                }`}
              >
                From Private Key
              </button>
              <button
                onClick={() => setInputType("mnemonic")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  inputType === "mnemonic"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                }`}
              >
                From Mnemonic
              </button>
            </div>
          </div>

          {/* Private Key Input */}
          {inputType === "private-key" && (
            <div>
              <label htmlFor='privateKey' className='block text-sm font-medium text-gray-700 mb-2'>
                Private Key
              </label>
              <input
                type='password'
                id='privateKey'
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                placeholder='Enter private key (with or without 0x prefix)'
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
              <p className='mt-1 text-xs text-gray-500'>64-character hexadecimal private key</p>
            </div>
          )}

          {/* Mnemonic Input */}
          {inputType === "mnemonic" && (
            <div className='space-y-4'>
              <div>
                <label htmlFor='mnemonic' className='block text-sm font-medium text-gray-700 mb-2'>
                  Mnemonic Phrase
                </label>
                <textarea
                  id='mnemonic'
                  value={mnemonicInput}
                  onChange={(e) => setMnemonicInput(e.target.value)}
                  placeholder='Enter your 12 or 24 word mnemonic phrase...'
                  rows={1}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label htmlFor='accountPath' className='block text-sm font-medium text-gray-700 mb-2'>
                  Derivation Path
                </label>
                <input
                  type='text'
                  id='accountPath'
                  value={accountPath}
                  onChange={(e) => setAccountPath(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                <p className='mt-1 text-xs text-gray-500'>Standard Ethereum path: m/44&apos;/60&apos;/0&apos;/0/0</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className='px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? "Generating..." : "Generate"}
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
          {result && (
            <div className='space-y-1'>
              {/* Mnemonic (if generated or provided) */}
              {result.mnemonic && (
                <div className='p-2 bg-purple-50 border border-purple-200 rounded-md'>
                  <div className='flex justify-between items-center mb-2'>
                    <h3 className='text-sm font-medium text-purple-800'>Mnemonic Phrase</h3>
                    <CopyComponent textToCopy={result.mnemonic} />
                  </div>
                  <div className='font-mono text-sm text-purple-700 break-all'>{result.mnemonic}</div>
                </div>
              )}

              {/* Private Key */}
              <div className='p-2 bg-red-50 border border-red-200 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-medium text-red-800'>Private Key</h3>
                  <CopyComponent textToCopy={result.privateKey} />
                </div>
                <div className='font-mono text-sm text-red-700 break-all'>{result.privateKey}</div>
              </div>

              {/* Public Key */}
              <div className='p-2 bg-blue-50 border border-blue-200 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-medium text-blue-800'>Public Key</h3>
                  <CopyComponent textToCopy={result.publicKey} />
                </div>
                <div className='font-mono text-sm text-blue-700 break-all'>{result.publicKey}</div>
              </div>

              {/* Address */}
              <div className='p-2 bg-green-50 border border-green-200 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-medium text-green-800'>Address</h3>

                  <CopyComponent textToCopy={result.address} />
                </div>
                <div className='font-mono text-sm text-green-700 break-all'>{result.address}</div>
              </div>
            </div>
          )}
        </div>

        {/* Security Warning */}
        <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-yellow-400' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-yellow-800'>Security Warning</h3>
              <p className='mt-1 text-sm text-yellow-700'>
                Keep your private keys and mnemonic phrases secure! Never share them with anyone. Store generated
                accounts safely as they cannot be recovered if lost. This tool processes everything locally in your
                browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { isHex } from "viem";
import CopyComponent from "../../copy";

export default function SignMessage() {
  const [privateKey, setPrivateKey] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSign = async () => {
    if (!privateKey.trim() || !message.trim()) {
      setError("Please enter both private key and message");
      return;
    }

    setIsLoading(true);
    setError("");
    setSignature("");
    setSignerAddress("");

    try {
      // Ensure private key starts with 0x
      const formattedPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

      // Validate private key format
      if (!isHex(formattedPrivateKey) || formattedPrivateKey.length !== 66) {
        throw new Error("Invalid private key format. Must be 64 hex characters (with or without 0x prefix)");
      }

      // Create account from private key
      const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);

      // Sign the message
      const signedMessage = await account.signMessage({
        message: message,
      });

      setSignature(signedMessage);
      setSignerAddress(account.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign message");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setPrivateKey("");
    setMessage("");
    setSignature("");
    setSignerAddress("");
    setError("");
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Message Signer</h2>

      <div className='space-y-3'>
        {/* Private Key Input */}
        <div>
          <label htmlFor='privateKey' className='block text-sm font-medium text-gray-700 mb-2'>
            Private Key
          </label>
          <input
            type='password'
            id='privateKey'
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder='Enter private key (with or without 0x prefix)'
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
          <p className='mt-1 text-xs text-gray-500'>64-character hexadecimal private key. Handle with extreme care!</p>
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-2'>
            Message to Sign
          </label>
          <textarea
            id='message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Enter the message you want to sign...'
            rows={2}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button
            onClick={handleSign}
            disabled={isLoading || !privateKey.trim() || !message.trim()}
            className='px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            {isLoading ? "Signing..." : "Sign Message"}
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
        {signerAddress && (
          <div className='space-y-4'>
            <div className='p-4 bg-green-50 border border-green-200 rounded-md'>
              <div className='font-mono text-sm text-green-700 break-all'>Signer Address: {signerAddress}</div>
            </div>
          </div>
        )}

        {signature && (
          <div className='space-y-4'>
            <div className='p-4 bg-blue-50 border border-blue-200 rounded-md'>
              <h3 className='text-sm font-medium text-blue-800 mb-2'>Signature</h3>
              <div className='font-mono text-sm text-blue-700 break-all'>{signature}</div>
              <CopyComponent textToCopy={signature} />
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
              Never share your private key with anyone. This tool processes your private key locally in your browser and
              does not send it to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

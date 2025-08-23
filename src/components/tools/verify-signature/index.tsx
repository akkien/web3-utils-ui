"use client";

import { useState } from "react";
import { recoverMessageAddress } from "viem";
import CopyComponent from "../../copy";

export const SignatureVerifier = () => {
  const [message, setMessage] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [recoveredAddress, setRecoveredAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setError("");
    setRecoveredAddress("");
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSignature(e.target.value);
    setError("");
    setRecoveredAddress("");
  };

  const verifySignature = async () => {
    setLoading(true);
    setError("");
    setRecoveredAddress("");

    try {
      // Validate inputs
      if (!message.trim()) {
        throw new Error("Message is required");
      }

      if (!signature.trim()) {
        throw new Error("Signature is required");
      }

      // Validate signature format
      const sig = signature.trim();
      if (!sig.startsWith("0x")) {
        throw new Error("Signature must start with 0x");
      }

      if (sig.length !== 132) {
        // 0x + 130 hex characters (65 bytes * 2)
        throw new Error("Invalid signature length. Expected 132 characters (including 0x prefix)");
      }

      if (!/^0x[0-9a-fA-F]{130}$/.test(sig)) {
        throw new Error("Invalid signature format. Must contain only hexadecimal characters");
      }

      // Recover the address using Viem
      const address = await recoverMessageAddress({
        message: message,
        signature: sig as `0x${string}`,
      });

      setRecoveredAddress(address);
    } catch (err: any) {
      console.error("Error verifying signature:", err);
      setError(err.message || "Failed to verify signature");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setMessage("");
    setSignature("");
    setRecoveredAddress("");
    setError("");
  };

  return (
    <div className='space-y-3'>
      <h2 className='text-2xl font-bold'>Ethereum Signature Verifier</h2>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Original Message:</label>
        <textarea
          value={message}
          onChange={handleMessageChange}
          className='w-full h-18 p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
          placeholder='Enter the original message that was signed...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Ethereum Signature:</label>
        <textarea
          value={signature}
          onChange={handleSignatureChange}
          className='w-full h-18 p-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500'
          placeholder='0x... (132 characters including 0x prefix)'
        />
        <p className='text-xs text-gray-500 mt-1'>
          Expected format: 0x followed by 130 hexadecimal characters (65 bytes)
        </p>
      </div>

      <div className='flex gap-3'>
        <button
          onClick={verifySignature}
          disabled={loading || !message.trim() || !signature.trim()}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? "Verifying..." : "Recover Address"}
        </button>

        <button
          onClick={clearAll}
          className='px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50'
        >
          Clear All
        </button>
      </div>

      {error && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-600'>{error}</p>
        </div>
      )}

      {recoveredAddress && (
        <div className='p-2 bg-green-50 border border-green-200 rounded-md'>
          <h3 className='text-lg font-semibold text-green-800 mb-2'>Recovered Signer Address</h3>
          <div className='flex justify-between items-center'>
            <p className='font-mono text-sm break-all text-green-700'>{recoveredAddress}</p>
            <CopyComponent textToCopy={recoveredAddress} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureVerifier;

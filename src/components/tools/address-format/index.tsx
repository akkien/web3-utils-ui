"use client";

import { useState } from "react";
import { isAddress, getAddress } from "viem";
import CopyComponent from "../../copy";

interface AddressFormats {
  uppercase: string;
  lowercase: string;
  checksum: string;
}

const placeHolderAddress = "0x1234567890abcdef1234567890abcdef12345678";

export const AddressFormatter = () => {
  const [inputAddress, setInputAddress] = useState<string>("");
  const [addressFormats, setAddressFormats] = useState<AddressFormats | null>({
    uppercase: placeHolderAddress,
    lowercase: placeHolderAddress,
    checksum: placeHolderAddress,
  });
  const [error, setError] = useState<string>("");

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setInputAddress(address);

    // Reset state
    setAddressFormats(null);
    setError("");

    // Only process if there's input
    if (!address.trim()) {
      return;
    }

    try {
      // Check if it's a valid Ethereum address using Viem
      if (!isAddress(address)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Get the checksum version using Viem
      const checksumAddress = getAddress(address);

      // Set the different formats
      setAddressFormats({
        uppercase: address.toUpperCase(),
        lowercase: address.toLowerCase(),
        checksum: checksumAddress,
      });
    } catch (err: any) {
      setError(err.message || "Invalid Ethereum address");
      setAddressFormats(null);
    }
  };

  return (
    <div className='space-y-2'>
      <h2 className='text-2xl font-bold'>Ethereum Address Formatter</h2>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Enter Ethereum Address:</label>
        <input
          type='text'
          value={inputAddress}
          onChange={handleAddressChange}
          className='w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500'
          placeholder={placeHolderAddress}
        />

        {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
      </div>

      {addressFormats && (
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold'>Address Formats</h3>

          <div className='flex justify-between items-center p-2 bg-gray-50 rounded-md'>
            <div className='flex-1'>
              <span className='text-gray-500 text-sm block mb-1'>Uppercase:</span>
              <p className='font-mono text-sm break-all'>{addressFormats.uppercase}</p>
            </div>
            <CopyComponent textToCopy={addressFormats.uppercase} />
          </div>

          <div className='flex justify-between items-center p-2 bg-gray-50 rounded-md'>
            <div className='flex-1'>
              <span className='text-gray-500 text-sm block mb-1'>Lowercase:</span>
              <p className='font-mono text-sm break-all'>{addressFormats.lowercase}</p>
            </div>
            <CopyComponent textToCopy={addressFormats.lowercase} />
          </div>

          <div className='flex justify-between items-center p-2 bg-green-50 rounded-md border border-green-200'>
            <div className='flex-1'>
              <span className='text-green-700 text-sm block mb-1'>Checksum (Recommended):</span>
              <p className='font-mono text-sm break-all font-semibold'>{addressFormats.checksum}</p>
            </div>
            <CopyComponent textToCopy={addressFormats.checksum} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressFormatter;

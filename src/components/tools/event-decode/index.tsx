"use client";

import { useState } from "react";
import { decodeEventLog } from "viem";
import CopyComponent from "@/components/copy";

interface EventInput {
  indexed: boolean;
  name: string;
  type: string;
}

interface ABIEvent {
  inputs: EventInput[];
  name: string;
  type: string;
  anonymous?: boolean;
}

interface DecodedEvent {
  eventName: string;
  args: any;
  signature: string;
  topic0: string;
  formattedArgs: { name: string; value: string; indexed: boolean; type: string }[];
}

export default function EventDecode() {
  const [contractABI, setContractABI] = useState("");
  const [logData, setLogData] = useState("");
  const [logTopics, setLogTopics] = useState("");
  const [decodedEvent, setDecodedEvent] = useState<DecodedEvent | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedABI, setParsedABI] = useState<ABIEvent[]>([]);

  const parseContractABI = (abiString: string): ABIEvent[] => {
    try {
      const abi = JSON.parse(abiString);

      if (!Array.isArray(abi)) {
        throw new Error("Contract ABI must be an array");
      }

      // Filter only event definitions
      const events = abi.filter((item: any) => item.type === "event") as ABIEvent[];

      if (events.length === 0) {
        throw new Error("No events found in the contract ABI");
      }

      // Ensure all events have inputs array
      events.forEach((event) => {
        if (!event.inputs) {
          event.inputs = [];
        }
      });

      return events;
    } catch (err) {
      if (err instanceof Error && err.message.includes("No events found")) {
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

    if (!logData.trim() && !logTopics.trim()) {
      setError("Please enter either log data or topics");
      return;
    }

    setIsLoading(true);
    setError("");
    setDecodedEvent(null);

    try {
      // Parse topics with support for single and double quotes
      let topics: string[] = [];
      if (logTopics.trim()) {
        try {
          // First try to parse as JSON
          const parsedTopics = JSON.parse(logTopics);
          if (Array.isArray(parsedTopics)) {
            topics = parsedTopics;
          } else {
            throw new Error("Topics must be an array");
          }
        } catch (err) {
          // Try to parse as single topic or comma-separated, handling quotes
          let topicsString = logTopics.trim();

          // Remove surrounding brackets if present
          if (topicsString.startsWith("[") && topicsString.endsWith("]")) {
            topicsString = topicsString.slice(1, -1);
          }

          if (topicsString.includes(",")) {
            // Split by comma and clean up quotes
            topics = topicsString.split(",").map((t) => {
              let cleaned = t.trim();
              // Remove surrounding quotes (both single and double)
              if (
                (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
                (cleaned.startsWith("'") && cleaned.endsWith("'"))
              ) {
                cleaned = cleaned.slice(1, -1);
              }
              return cleaned;
            });
          } else {
            // Single topic, remove quotes if present
            let cleaned = topicsString;
            if (
              (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
              (cleaned.startsWith("'") && cleaned.endsWith("'"))
            ) {
              cleaned = cleaned.slice(1, -1);
            }
            topics = [cleaned];
          }
        }
      }

      if (topics.length === 0) {
        throw new Error("At least one topic is required for event detection");
      }

      // Use viem to decode the event log
      const decoded = decodeEventLog({
        abi: parsedABI,
        data: (logData.trim() || "0x") as `0x${string}`,
        topics: topics as [`0x${string}`, ...`0x${string}`[]],
      });

      // Find the matching event in ABI for signature
      const eventDef = parsedABI.find((event) => event.name === decoded.eventName);
      const signature = eventDef
        ? `${eventDef.name}(${eventDef.inputs.map((input) => input.type).join(",")})`
        : decoded.eventName || "Unknown";

      // Format arguments for display
      const formattedArgs: { name: string; value: string; indexed: boolean; type: string }[] = [];

      if (eventDef && decoded.args) {
        // Convert decoded args object to array format
        const argsArray = Object.values(decoded.args);

        for (let i = 0; i < eventDef.inputs.length; i++) {
          const input = eventDef.inputs[i];
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
            indexed: input.indexed,
            type: input.type,
          });
        }
      }

      setDecodedEvent({
        eventName: decoded.eventName || "Unknown",
        args: decoded.args,
        signature: signature,
        topic0: topics[0],
        formattedArgs,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decode event");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setContractABI("");
    setLogData("");
    setLogTopics("");
    setDecodedEvent(null);
    setParsedABI([]);
    setError("");
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Event Decoder</h2>

      <div className='space-y-4'>
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
              // Auto-parse ABI to extract events
              try {
                const events = parseContractABI(e.target.value);
                setParsedABI(events);
                setError("");
              } catch (err) {
                setParsedABI([]);
              }
            }}
            placeholder='[{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}, ...]'
            rows={6}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Log Topics */}
          <div>
            <label htmlFor='logTopics' className='block text-sm font-medium text-gray-700 mb-2'>
              Log Topics (JSON Array or comma-separated)
            </label>
            <textarea
              id='logTopics'
              value={logTopics}
              onChange={(e) => setLogTopics(e.target.value)}
              placeholder='["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x000000000000000000000000a1b2c3..."] or &#39;0xddf252...&#39;,&#39;0x000000...&#39; or "0xddf252...","0x000000..."'
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
            />
          </div>

          {/* Log Data */}
          <div>
            <label htmlFor='logData' className='block text-sm font-medium text-gray-700 mb-2'>
              Log Data (Hex)
            </label>
            <textarea
              id='logData'
              value={logData}
              onChange={(e) => setLogData(e.target.value)}
              placeholder='0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button
            onClick={handleDecode}
            disabled={isLoading || !contractABI.trim()}
            className='px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            {isLoading ? "Decoding..." : "Decode Event"}
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

        {/* Decoded Event Results */}
        {decodedEvent && (
          <div className='space-y-4'>
            {/* Formatted Decoded Arguments */}
            {decodedEvent.formattedArgs.length > 0 && (
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-md'>
                <h3 className='text-sm font-medium text-blue-800 mb-3'>Decoded Arguments</h3>
                <div className='space-y-3'>
                  {decodedEvent.formattedArgs.map((arg, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-blue-200 rounded bg-white'
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
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Indexed</label>
                        <div className={`text-sm font-medium ${arg.indexed ? "text-green-600" : "text-gray-500"}`}>
                          {arg.indexed ? "Yes" : "No"}
                        </div>
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

            {/* Event Summary */}
            <div className='p-4 bg-purple-50 border border-purple-200 rounded-md'>
              <h3 className='text-sm font-medium text-purple-800 mb-3'>Event Summary</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center p-2 bg-white rounded border'>
                    <span className='text-sm font-medium text-gray-600'>Event Name:</span>
                    <div className='flex items-center space-x-2'>
                      <span className='font-mono text-sm text-purple-700'>{decodedEvent.eventName}</span>
                      <CopyComponent textToCopy={decodedEvent.eventName} />
                    </div>
                  </div>
                  <div className='flex justify-between items-center p-2 bg-white rounded border'>
                    <span className='text-sm font-medium text-gray-600'>Arguments Count:</span>
                    <span className='font-mono text-sm text-purple-700'>{decodedEvent.formattedArgs.length}</span>
                  </div>
                  <div className='flex justify-between items-center p-2 bg-white rounded border'>
                    <span className='text-sm font-medium text-gray-600'>Indexed Count:</span>
                    <span className='font-mono text-sm text-purple-700'>
                      {decodedEvent.formattedArgs.filter((arg) => arg.indexed).length}
                    </span>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='p-2 bg-white rounded border'>
                    <div className='text-sm font-medium text-gray-600 mb-1'>Event Signature:</div>
                    <div className='flex items-center space-x-2'>
                      <code className='font-mono text-sm text-purple-700 break-all flex-1'>
                        {decodedEvent.signature}
                      </code>
                      <CopyComponent textToCopy={decodedEvent.signature} />
                    </div>
                  </div>
                  <div className='p-2 bg-white rounded border'>
                    <div className='text-sm font-medium text-gray-600 mb-1'>Topic0 (Event Hash):</div>
                    <div className='flex items-center space-x-2'>
                      <code className='font-mono text-xs text-purple-700 break-all flex-1'>{decodedEvent.topic0}</code>
                      <CopyComponent textToCopy={decodedEvent.topic0} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h3 className='text-sm font-medium text-blue-800 mb-2'>Usage Instructions</h3>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>• Enter the full contract ABI in JSON format</li>
          <li>
            • Provide log topics as JSON array, comma-separated with single/double quotes, or plain comma-separated
          </li>
          <li>
            • Supported topic formats: [&quot;0xabc...&quot;], &quot;0xabc...&quot;,&quot;0xdef...&quot; or
            &#39;0xabc...&#39;,&#39;0xdef...&#39;
          </li>
          <li>• Enter log data as hex string (can be empty for events with only indexed parameters)</li>
          <li>• Event will be automatically detected from the topic0 (event signature hash)</li>
          <li>• Shows both formatted arguments with types and raw viem decoded output</li>
          <li>• Topics[0] is the event signature hash used for auto-detection</li>
          <li>• Indexed parameters are encoded in topics, non-indexed in data</li>
        </ul>
      </div>
    </div>
  );
}

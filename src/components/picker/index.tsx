"use client";

import { useState, useEffect } from "react";
import BaseConverter from "../tools/base-convert";
import AbiDecoder from "../tools/abi-decode";
import AbiEncode from "../tools/abi-encode";
import AddressFormatter from "../tools/address-format";
import AddressGenerator from "../tools/address-generate";
import HashGenerator from "../tools/hash";
import SignMessage from "../tools/sign-message";
import SignatureVerifier from "../tools/verify-signature";

// Define a hierarchical structure for topics with up to 3 levels
const topics = [
  {
    id: "ethereum",
    name: "",
    subtopics: [
      {
        id: "ethereum",
        name: "Ethereum",
        options: [
          { id: "eth_tx", name: "Number Base Converter", component: <BaseConverter /> },
          { id: "eth_abi_decode", name: "ABI Decoder", component: <AbiDecoder /> },
          { id: "eth_abi_encode", name: "ABI Encoder", component: <AbiEncode /> },
          { id: "eth_address_generator", name: "Address Generator", component: <AddressGenerator /> },
          { id: "eth_address_format", name: "Address Formatter", component: <AddressFormatter /> },
          { id: "eth_hash", name: "Hash", component: <HashGenerator /> },
          { id: "eth_sign", name: "Sign Message", component: <SignMessage /> },
          { id: "eth_verify", name: "Verify Signatures", component: <SignatureVerifier /> },
        ],
      },
    ],
  },
  // {
  //   id: "other-topic",
  //   name: "Other Topics",
  //   subtopics: [],
  // },
];

export const Picker = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>("ethereum"); // Default selected topic
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Set the default subtopic when component mounts or selectedTopic changes
  useEffect(() => {
    if (selectedTopic) {
      const topic = topics.find((t) => t.id === selectedTopic);
      if (topic && topic.subtopics.length > 0) {
        setSelectedSubtopic(topic.subtopics[0].id);
      }
    }
  }, [selectedTopic]);

  // Set the default option when selectedSubtopic changes
  useEffect(() => {
    if (selectedTopic && selectedSubtopic) {
      const topic = topics.find((t) => t.id === selectedTopic);
      const subtopic = topic?.subtopics.find((s) => s.id === selectedSubtopic);

      if (subtopic && subtopic.options.length > 0) {
        setSelectedOption(subtopic.options[0].id);
      }
    }
  }, [selectedTopic, selectedSubtopic]);

  // Handle first level selection
  const handleTopicClick = (topicId: string) => {
    if (topicId !== selectedTopic) {
      setSelectedTopic(topicId);
      // The default subtopic and option will be set by useEffect
    }
  };

  // Handle second level selection
  const handleSubtopicClick = (subtopicId: string) => {
    if (subtopicId !== selectedSubtopic) {
      setSelectedSubtopic(subtopicId);
      // The default option will be set by useEffect
    }
  };

  // Handle third level selection
  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
    console.log(`Selected option: ${optionId}`);
  };

  // Find the current topic and subtopic objects
  const currentTopic = topics.find((t) => t.id === selectedTopic);
  const currentSubtopic = currentTopic?.subtopics?.find((s) => s.id === selectedSubtopic);
  const currentOption = currentSubtopic?.options?.find((s) => s.id === selectedOption);

  return (
    <div className='w-full'>
      {/* First level - Main Topics */}
      <div className='mb-2 hidden'>
        <div className='flex flex-wrap gap-3'>
          {topics.map((topic) => (
            <button
              key={topic.id}
              className={`
                py-1 px-4 rounded-3xl transition-all
                ${
                  selectedTopic === topic.id
                    ? "bg-blue-500 text-white font-bold"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                }
              `}
              onClick={() => handleTopicClick(topic.id)}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Second level - Subtopics (always visible if a topic is selected) */}
      {selectedTopic && (
        <div className='mb-2'>
          <div className='flex flex-wrap gap-3'>
            {currentTopic?.subtopics.map((subtopic) => (
              <button
                key={subtopic.id}
                className={`
                  py-1 px-4 rounded-3xl transition-all
                  ${
                    selectedSubtopic === subtopic.id
                      ? "bg-purple-500 text-white font-bold"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                  }
                `}
                onClick={() => handleSubtopicClick(subtopic.id)}
              >
                {subtopic.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Third level - Options (always visible if a subtopic is selected) */}
      {selectedSubtopic && currentSubtopic && (
        <div className='mb-2'>
          <div className='flex flex-wrap gap-3'>
            {currentSubtopic.options.map((option) => (
              <button
                key={option.id}
                className={`
                  py-1 px-4 rounded-3xl transition-all text-sm
                  ${
                    selectedOption === option.id
                      ? "bg-green-500 text-white font-bold"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                  }
                `}
                onClick={() => handleOptionClick(option.id)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content area for selected option */}
      {selectedOption && (
        <div className='mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200'>
          {selectedOption === "eth_tx" && currentOption?.component}
          {selectedOption === "eth_abi_decode" && currentOption?.component}
          {selectedOption === "eth_abi_encode" && currentOption?.component}
          {selectedOption === "eth_address_generator" && currentOption?.component}
          {selectedOption === "eth_address_format" && currentOption?.component}
          {selectedOption === "eth_hash" && currentOption?.component}
          {selectedOption === "eth_sign" && currentOption?.component}
          {selectedOption === "eth_verify" && currentOption?.component}
        </div>
      )}
    </div>
  );
};

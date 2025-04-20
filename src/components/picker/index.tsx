"use client";

import { useState } from "react";

// Define a hierarchical structure for topics with up to 3 levels
const topics = [
  {
    id: "blockchain",
    name: "Blockchain",
    subtopics: [
      {
        id: "ethereum",
        name: "Ethereum",
        options: [
          { id: "eth_tx", name: "Transactions" },
          { id: "eth_abi", name: "ABI Encoding" },
          { id: "eth_sig", name: "Signatures" },
        ],
      },
      {
        id: "solana",
        name: "Solana",
        options: [
          { id: "solana_ix_data_to_discriminator", name: "Instruction Data to Discriminator" },
          { id: "solana_ix_name_to_discriminator", name: "Instruction Name to Discriminator" },
          { id: "solana_tx", name: "Transaction Format" },
        ],
      },
    ],
  },
  {
    id: "defi",
    name: "DeFi",
    subtopics: [
      {
        id: "lending",
        name: "Lending",
        options: [
          { id: "aave", name: "Aave Protocol" },
          { id: "compound", name: "Compound" },
        ],
      },
      {
        id: "exchange",
        name: "Exchange",
        options: [
          { id: "amm", name: "AMM Swaps" },
          { id: "orderbook", name: "Orderbook" },
        ],
      },
    ],
  },
  {
    id: "nft",
    name: "NFT",
    subtopics: [
      {
        id: "standards",
        name: "Standards",
        options: [
          { id: "erc721", name: "ERC-721" },
          { id: "erc1155", name: "ERC-1155" },
        ],
      },
      {
        id: "marketplaces",
        name: "Marketplaces",
        options: [
          { id: "opensea", name: "OpenSea" },
          { id: "blur", name: "Blur" },
        ],
      },
    ],
  },
  {
    id: "security",
    name: "Security",
    subtopics: [
      {
        id: "auditing",
        name: "Auditing",
        options: [
          { id: "static_analysis", name: "Static Analysis" },
          { id: "symbolic_execution", name: "Symbolic Execution" },
        ],
      },
      {
        id: "attacks",
        name: "Common Attacks",
        options: [
          { id: "reentrancy", name: "Reentrancy" },
          { id: "flash_loans", name: "Flash Loan Attacks" },
        ],
      },
    ],
  },
  {
    id: "dao",
    name: "DAO",
    subtopics: [
      {
        id: "governance",
        name: "Governance",
        options: [
          { id: "voting_systems", name: "Voting Systems" },
          { id: "proposals", name: "Proposal Mechanics" },
        ],
      },
      {
        id: "treasury",
        name: "Treasury",
        options: [
          { id: "multisig", name: "Multisig" },
          { id: "vaults", name: "Treasury Vaults" },
        ],
      },
    ],
  },
];

export const Picker = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Handle first level selection
  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(topicId);
    setSelectedSubtopic(null);
    setSelectedOption(null);
  };

  // Handle second level selection
  const handleSubtopicClick = (subtopicId: string) => {
    setSelectedSubtopic(subtopicId);
    setSelectedOption(null);
  };

  // Handle third level selection
  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
    console.log(`Selected option: ${optionId}`);
  };

  // Find the current topic and subtopic objects
  const currentTopic = topics.find((t) => t.id === selectedTopic);
  const currentSubtopic = currentTopic?.subtopics?.find((s) => s.id === selectedSubtopic);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Blockchain Utilities</h1>
        <p className="text-gray-600">Select a topic to explore blockchain utilities and tools</p>
      </div>
      
      {/* First level - Main Topics */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3 font-medium">Topics</h2>
        <div className="flex flex-wrap gap-3">
          {topics.map((topic) => (
            <button
              key={topic.id}
              className={`
                py-2 px-4 rounded-3xl transition-all
                ${selectedTopic === topic.id 
                  ? "bg-blue-500 text-white font-bold" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"}
              `}
              onClick={() => handleTopicClick(topic.id)}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Second level - Subtopics (show only if a topic is selected) */}
      {selectedTopic && (
        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3 font-medium">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {currentTopic?.subtopics.map((subtopic) => (
              <button
                key={subtopic.id}
                className={`
                  py-2 px-4 rounded-3xl transition-all
                  ${selectedSubtopic === subtopic.id 
                    ? "bg-purple-500 text-white font-bold" 
                    : "bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium"}
                `}
                onClick={() => handleSubtopicClick(subtopic.id)}
              >
                {subtopic.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Third level - Options (show only if a subtopic is selected) */}
      {selectedSubtopic && currentSubtopic && (
        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3 font-medium">Options</h2>
          <div className="flex flex-wrap gap-3">
            {currentSubtopic.options.map((option) => (
              <button
                key={option.id}
                className={`
                  py-2 px-4 rounded-3xl transition-all
                  ${selectedOption === option.id 
                    ? "bg-green-500 text-white font-bold" 
                    : "bg-green-100 hover:bg-green-200 text-green-800 font-medium"}
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
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Selected path:</div>
            <div className="font-medium">
              {currentTopic?.name} {' > '} 
              {currentSubtopic?.name} {' > '} 
              {currentSubtopic?.options.find(o => o.id === selectedOption)?.name}
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-4">Content for: {selectedOption}</h3>
          <p className="text-gray-600">Here you would display the component or content for the selected option.</p>
          {/* Here you can conditionally render components based on the selectedOption ID */}
        </div>
      )}
    </div>
  );
};

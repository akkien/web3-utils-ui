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
    setSelectedSubtopic(null); // Reset subtopic selection
    setSelectedOption(null); // Reset option selection
  };

  // Handle second level selection
  const handleSubtopicClick = (subtopicId: string) => {
    setSelectedSubtopic(subtopicId);
    setSelectedOption(null); // Reset option selection
  };

  // Handle third level selection
  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
    // Here you can implement what happens when a final option is selected
    console.log(`Selected option: ${optionId}`);
  };

  // Render the content based on current selection
  const renderContent = () => {
    // If no topic selected, show all topics
    if (!selectedTopic) {
      return (
        <div className="flex flex-wrap gap-3 mt-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-3xl transition-all"
              onClick={() => handleTopicClick(topic.id)}
            >
              {topic.name}
            </button>
          ))}
        </div>
      );
    }

    // Find the selected topic
    const topic = topics.find((t) => t.id === selectedTopic);
    if (!topic) return null;

    // If no subtopic selected, show subtopics for the selected topic
    if (!selectedSubtopic) {
      return (
        <div>
          <div className="flex items-center mb-4">
            <button 
              className="mr-2 text-blue-500 hover:text-blue-700" 
              onClick={() => setSelectedTopic(null)}
            >
              ← Back
            </button>
            <h2 className="text-lg font-bold">{topic.name}</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {topic.subtopics.map((subtopic) => (
              <button
                key={subtopic.id}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-3xl transition-all"
                onClick={() => handleSubtopicClick(subtopic.id)}
              >
                {subtopic.name}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Find the selected subtopic
    const subtopic = topic.subtopics.find((s) => s.id === selectedSubtopic);
    if (!subtopic) return null;

    // Show options for the selected subtopic
    return (
      <div>
        <div className="flex items-center mb-4">
          <button 
            className="mr-2 text-blue-500 hover:text-blue-700" 
            onClick={() => setSelectedSubtopic(null)}
          >
            ← Back
          </button>
          <h2 className="text-lg font-bold">{topic.name} / {subtopic.name}</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {subtopic.options.map((option) => (
            <button
              key={option.id}
              className={`${
                selectedOption === option.id
                  ? "bg-green-500 text-white"
                  : "bg-green-100 hover:bg-green-200 text-green-800"
              } font-medium py-2 px-4 rounded-3xl transition-all`}
              onClick={() => handleOptionClick(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Blockchain Utilities</h1>
        <p className="text-gray-600">Select a topic to explore blockchain utilities and tools</p>
      </div>
      
      {renderContent()}
      
      {selectedOption && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Content for: {selectedOption}</h3>
          <p className="text-gray-600">Here you would display the component or content for the selected option.</p>
          {/* Here you can conditionally render components based on the selectedOption ID */}
        </div>
      )}
    </div>
  );
};

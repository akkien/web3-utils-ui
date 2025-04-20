"use client";

// import { ixNameToDiscriminator } from "@/components/utils/solana/ix_name_to_discriminator/func";
// import * as fs from "fs";
// import Editor from "@monaco-editor/react";

const features = [
  {
    id: "solana_ix_data_to_discriminator",
    name: "Instruction data to Discriminator",
    code: "src/components/utils/solana/ix_data_to_discriminator/func.ts",
  },
  {
    id: "solana_ix_name_to_discriminator",
    name: "Instruction name to Discriminator",
    code: "src/components/utils/solana/ix_name_to_discriminator/func.ts",
  },
];

// const code = fs.readFileSync("./src/components/utils/solana/ix_data_to_discriminator/index.tsx", "utf-8");

export const Picker = () => {
  return (
    <div className='flex justify-between'>
      <div>
        {features.map((item) => (
          <button key={item.id} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl'>
            {item.name}
          </button>
        ))}
      </div>
      {/* <Editor height='60vh' defaultLanguage='javascript' defaultValue='// Write your code here' />; */}
    </div>
  );
};

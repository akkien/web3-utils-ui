"use client";
import { useState } from "react";
import FileCodeViewer from "@/components/code-viewer/FileCodeViewer";

export default function CodeViewerPage() {
  const [filePath, setFilePath] = useState("src/components/utils/solana/ix_name_to_discriminator/func.ts");

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>File Path (relative to project root):</label>
        <input
          type='text'
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          className='w-full p-2 border border-gray-300 rounded-md'
          placeholder='e.g., src/components/utils/solana/ix_name_to_discriminator/func.ts'
        />
      </div>

      <div className='mt-4'>
        <FileCodeViewer filePath={"src/components/utils/solana/ix_name_to_discriminator/func.ts"} />
      </div>
    </div>
  );
}

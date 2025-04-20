"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface FileCodeViewerProps {
  filePath: string;
  height?: string;
}

export default function FileCodeViewer({ filePath, height = "500px" }: FileCodeViewerProps) {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/read-file?path=${encodeURIComponent(filePath)}`);
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
        const content = await response.text();
        setCode(content);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file");
        setCode("");
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [filePath]);

  if (loading) {
    return <div className='h-[500px] bg-gray-100 rounded-lg animate-pulse' />;
  }

  if (error) {
    return <div className='p-4 bg-red-50 text-red-600 rounded-lg'>Error: {error}</div>;
  }

  const language = "typescript";

  return (
    <MonacoEditor
      height={height}
      defaultLanguage={language}
      value={code}
      theme='vs-dark'
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        automaticLayout: true,
      }}
    />
  );
}

import { useState } from "react";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

const CopyComponent = ({ textToCopy }: { textToCopy: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Handle error, e.g., show an error message
    }
  };

  return (
    <span onClick={handleCopy}>
      {isCopied ? <CheckIcon className='size-4' /> : <DocumentDuplicateIcon className='size-4' />}
    </span>
  );
};

export default CopyComponent;

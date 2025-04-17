
import React, { useRef } from "react";

interface FileInputsProps {
  onFileSelect: (files: FileList) => void;
  onImageSelect: (files: FileList) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  imageInputRef: React.RefObject<HTMLInputElement>;
}

const FileInputs: React.FC<FileInputsProps> = ({
  onFileSelect,
  onImageSelect,
  fileInputRef,
  imageInputRef,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
      e.target.value = ""; // Reset input
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelect(e.target.files);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageChange}
        className="hidden"
        accept="image/*"
        multiple
      />
    </>
  );
};

export default FileInputs;

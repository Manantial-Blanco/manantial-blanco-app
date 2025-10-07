'use client';

import { useState, useRef, DragEvent } from 'react';

interface ImageUploadProps {
  onUpload: (file: File, preview: string) => void;
  currentImage: string | null;
}

export default function ImageUpload({ onUpload, currentImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith('image/'));

    if (imageFile) {
      processFile(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {currentImage ? (
        <div className="relative">
          <img 
            src={currentImage} 
            alt="Uploaded artwork" 
            className="w-full h-64 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-50 font-medium text-sm"
          >
            Change Image
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path 
                d="M24 16V32M16 24H32M42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C33.9411 6 42 14.0589 42 24Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-base font-medium text-gray-700 mb-1">
                Drag and drop your image here
              </p>
              <p className="text-sm text-gray-500 mb-2">or</p>
              <p className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Click here to upload
              </p>
            </div>
            <p className="text-xs text-gray-500">.JPG .PNG .JPEG</p>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { Paperclip, X, FileIcon, Loader2 } from "lucide-react";

interface Attachment {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

interface FileUploadProps {
  onUploadComplete: (attachments: Attachment[]) => void;
  maxSizeMB?: number;
}

export function FileUpload({ onUploadComplete, maxSizeMB = 10 }: FileUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<Attachment[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is ${maxSizeMB}MB.`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newAttachments.push(data);
        } else {
          console.error("Upload failed for file:", file.name);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    const updatedFiles = [...uploadedFiles, ...newAttachments];
    setUploadedFiles(updatedFiles);
    onUploadComplete(updatedFiles);
    setIsUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onUploadComplete(updatedFiles);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center transition-colors hover:border-zinc-600 hover:bg-zinc-800/20"
      >
        <Paperclip className="mx-auto h-8 w-8 text-zinc-500" />
        <p className="mt-2 text-sm text-zinc-400">
          {isUploading ? "Uploading..." : "Click to browse or drag and drop"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          PNG, JPG, PDF up to {maxSizeMB}MB
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {uploadedFiles.map((file, index) => (
            <div 
              key={index}
              className="group relative flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-700/50">
                <FileIcon className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{file.filename}</p>
                <p className="text-xs text-zinc-500">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-transform hover:scale-110 group-hover:flex"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing files...
        </div>
      )}
    </div>
  );
}

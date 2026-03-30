import { type DragEvent, type ChangeEvent, useState, useRef } from "react";
import type { ExtractionProgress } from "../types/comic";

interface DropZoneProps {
  onFile: (file: File) => void;
  progress: ExtractionProgress | null;
  isExtracting: boolean;
}

export function DropZone({ onFile, progress, isExtracting }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      className={`dropzone ${isDragOver ? "dropzone--active" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".cbz,.cbr"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      {isExtracting && progress ? (
        <div className="dropzone__progress">
          <div className="spinner" />
          <p>Extracting...</p>
          <p className="dropzone__count">
            {progress.pagesExtracted} / {progress.totalFiles} pages
          </p>
        </div>
      ) : (
        <div className="dropzone__prompt">
          <p className="dropzone__title">Drop a comic here</p>
          <p className="dropzone__subtitle">
            CBZ and CBR files supported — or click to browse
          </p>
        </div>
      )}
    </div>
  );
}

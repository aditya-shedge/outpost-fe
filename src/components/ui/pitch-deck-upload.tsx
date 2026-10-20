"use client";

import { useState, useRef, useCallback } from "react";
import { meApi } from "@/lib/api/me";
import { Icon, Button, showToast } from "@/components/ui";
import type { PitchDeckResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface PitchDeckUploadProps {
  initialPitchDeck?: PitchDeckResponse | null;
  onUploadSuccess?: (pitchDeck: PitchDeckResponse) => void;
  onDeleteSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function PitchDeckUpload({
  initialPitchDeck,
  onUploadSuccess,
  onDeleteSuccess,
}: PitchDeckUploadProps) {
  const [pitchDeck, setPitchDeck] = useState<PitchDeckResponse | null>(initialPitchDeck || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return "File exceeds the 10 MB size limit";
    }

    // Check file type (basic check - backend validates magic bytes)
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return "Only PDF files are allowed";
    }

    return null;
  };

  const handleUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      showToast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (actual progress tracking would require XHR)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await meApi.uploadPitchDeck(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setPitchDeck(result);
      showToast.success("Pitch deck uploaded successfully");
      onUploadSuccess?.(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload pitch deck";
      showToast.error(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!pitchDeck) return;

    setIsDeleting(true);
    try {
      await meApi.deletePitchDeck();
      setPitchDeck(null);
      showToast.success("Pitch deck deleted");
      onDeleteSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete pitch deck";
      showToast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, []);

  const handleDownload = () => {
    // Open presigned URL in new tab - backend returns 302 redirect
    window.open(meApi.getPitchDeckUrl(), "_blank");
  };

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show current pitch deck if exists
  if (pitchDeck && !isUploading) {
    return (
      <div className="border border-line bg-paper p-4">
        <div className="flex items-start gap-4">
          {/* PDF Icon */}
          <div className="w-12 h-12 bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <path fill="white" d="M14 2v6h6" />
              <text x="8" y="18" fontSize="6" fill="currentColor" fontWeight="bold">PDF</text>
            </svg>
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink truncate">
              {pitchDeck.fileName || "pitch-deck.pdf"}
            </p>
            <p className="text-sm text-muted">
              {formatFileSize(pitchDeck.sizeBytes)}
              {pitchDeck.uploadedAt && ` • Uploaded ${formatDate(pitchDeck.uploadedAt)}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 text-muted hover:text-ink hover:bg-paper-light transition-colors"
              aria-label="Download pitch deck"
            >
              <Icon name="arrow" className="w-4 h-4 rotate-90" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              aria-label="Delete pitch deck"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <Icon name="x" className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Replace option */}
        <div className="mt-3 pt-3 border-t border-line">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-green hover:underline"
          >
            Replace with new file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // Show upload area
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed p-8 text-center transition-colors",
        isDragging
          ? "border-green bg-green/5"
          : "border-line hover:border-ink/30",
        isUploading && "opacity-50 pointer-events-none"
      )}
    >
      {isUploading ? (
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-green/20 border-t-green rounded-full animate-spin" />
          <p className="text-ink font-medium">Uploading...</p>
          <div className="w-48 h-2 mx-auto bg-paper-light rounded-full overflow-hidden">
            <div
              className="h-full bg-green transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 mx-auto mb-4 bg-paper-light rounded-full flex items-center justify-center">
            <Icon name="arrow" className="w-6 h-6 text-muted -rotate-90" />
          </div>
          <p className="text-ink font-medium mb-1">
            {isDragging ? "Drop your PDF here" : "Drag and drop your pitch deck"}
          </p>
          <p className="text-sm text-muted mb-4">PDF only, max 10 MB</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}

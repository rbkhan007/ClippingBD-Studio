'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, File, Image, Video, FileText, X, CheckCircle, 
  AlertCircle, Loader2, CloudUpload, FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// File types
type FileType = 'image' | 'video' | 'document' | 'other';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: FileType;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
  file?: File;
}

interface FileUploadProps {
  accept?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  bucket?: string;
  onUpload?: (files: UploadedFile[]) => void;
  onFileSuccess?: (file: UploadedFile) => void;
  onFileError?: (file: UploadedFile, error: string) => void;
  className?: string;
  autoUpload?: boolean;
  showPreview?: boolean;
  allowMultiple?: boolean;
}

// Helper functions
const getFileType = (file: File): FileType => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
  return 'other';
};

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'image': return Image;
    case 'video': return Video;
    case 'document': return FileText;
    default: return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileColor = (type: FileType): string => {
  switch (type) {
    case 'image': return 'text-emerald-400 bg-emerald-500/20';
    case 'video': return 'text-purple-400 bg-purple-500/20';
    case 'document': return 'text-blue-400 bg-blue-500/20';
    default: return 'text-slate-400 bg-slate-500/20';
  }
};

export function FileUpload({
  accept = ['image/*', 'video/*', 'application/pdf'],
  maxSize = 50, // 50MB default
  maxFiles = 10,
  bucket = 'assets',
  onUpload,
  onFileSuccess,
  onFileError,
  className,
  autoUpload = true,
  showPreview = true,
  allowMultiple = true,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    
    // Check file type
    const isAccepted = accept.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.slice(0, -2);
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.endsWith(type.replace('.', ''));
    });
    
    if (!isAccepted) {
      return `File type not accepted. Allowed: ${accept.join(', ')}`;
    }
    
    return null;
  }, [accept, maxSize]);
  
  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);
      
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: getFileType(file),
        progress: 0,
        status: validationError ? 'error' : 'pending',
        error: validationError || undefined,
        file,
      };
      
      newFiles.push(uploadedFile);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    
    if (onUpload) {
      onUpload(newFiles);
    }
    
    // Auto upload if enabled
    if (autoUpload) {
      for (const uploadedFile of newFiles) {
        if (uploadedFile.status !== 'error') {
          uploadFile(uploadedFile);
        }
      }
    }
  }, [validateFile, autoUpload, onUpload]);
  
  const uploadFile = async (uploadedFile: UploadedFile) => {
    if (!uploadedFile.file) return;
    
    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === uploadedFile.id ? { ...f, status: 'uploading', progress: 0 } : f
    ));
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('bucket', bucket);
      formData.append('path', `${Date.now()}-${uploadedFile.file.name}`);
      
      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === uploadedFile.id && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 200);
      
      const response = await fetch('/api/assets', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'success', progress: 100, url: result.url }
          : f
      ));
      
      if (onFileSuccess) {
        onFileSuccess({ ...uploadedFile, status: 'success', url: result.url });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));
      
      if (onFileError) {
        onFileError(uploadedFile, errorMessage);
      }
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);
  
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);
  
  const retryUpload = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      uploadFile(file);
    }
  }, [files]);
  
  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          isDragging 
            ? 'border-emerald-500 bg-emerald-500/10' 
            : 'border-white/20 hover:border-emerald-500/50 hover:bg-white/5',
          files.length >= maxFiles && 'opacity-50 pointer-events-none'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept.join(',')}
          multiple={allowMultiple}
          onChange={handleInputChange}
          disabled={files.length >= maxFiles}
        />
        
        <motion.div
          animate={{ scale: isDragging ? 1.05 : 1 }}
          className="flex flex-col items-center"
        >
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors',
            isDragging ? 'bg-emerald-500/20' : 'bg-white/5'
          )}>
            {isDragging ? (
              <CloudUpload className="w-8 h-8 text-emerald-400" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop files'}
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            or click to browse from your computer
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-xs">
              Max {maxSize}MB per file
            </Badge>
            <Badge variant="outline" className="text-xs">
              {allowMultiple ? `Up to ${maxFiles} files` : 'Single file'}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {accept.map(type => (
              <span key={type} className="text-xs text-slate-500">
                {type.replace('/*', '').replace('application/', '').toUpperCase()}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-slate-400 hover:text-white"
              >
                Clear all
              </Button>
            </div>
            
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0 divide-y divide-white/10">
                {files.map((file, index) => {
                  const Icon = getFileIcon(file.type);
                  
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3"
                    >
                      {/* File Icon / Preview */}
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        getFileColor(file.type)
                      )}>
                        {file.type === 'image' && showPreview && file.file ? (
                          <img
                            src={URL.createObjectURL(file.file)}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <Progress value={file.progress} className="h-1 mt-2" />
                        )}
                        
                        {/* Error Message */}
                        {file.status === 'error' && file.error && (
                          <p className="text-xs text-red-400 mt-1">{file.error}</p>
                        )}
                      </div>
                      
                      {/* Status / Actions */}
                      <div className="flex items-center gap-2">
                        {file.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => uploadFile(file)}
                            className="border-white/10"
                          >
                            Upload
                          </Button>
                        )}
                        
                        {file.status === 'uploading' && (
                          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                        )}
                        
                        {file.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        )}
                        
                        {file.status === 'error' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => retryUpload(file.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Retry
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Image Comparison Viewer Component
export function ImageComparisonViewer({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-slate-800 rounded-full" />
            <div className="w-1 h-4 bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-4 left-4 px-2 py-1 rounded bg-black/50 text-xs font-medium">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 px-2 py-1 rounded bg-black/50 text-xs font-medium">
        {afterLabel}
      </div>
    </div>
  );
}

import React, { InputHTMLAttributes, useState, forwardRef } from 'react';

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'audio' | 'video' | 'zip' | 'csv' | 'text' | 'document' | 'any';

export const FILE_TYPE_CONFIG: Record<FileType, { extensions: string[], maxSize: number, label: string }> = {
  image: { extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'], maxSize: 200 * 1024, label: 'Image (max 200KB)' },
  pdf: { extensions: ['.pdf'], maxSize: 5 * 1024 * 1024, label: 'PDF (max 5MB)' },
  word: { extensions: ['.doc', '.docx'], maxSize: 5 * 1024 * 1024, label: 'Word (max 5MB)' },
  excel: { extensions: ['.xls', '.xlsx'], maxSize: 5 * 1024 * 1024, label: 'Excel (max 5MB)' },
  powerpoint: { extensions: ['.ppt', '.pptx'], maxSize: 5 * 1024 * 1024, label: 'PowerPoint (max 5MB)' },
  audio: { extensions: ['.mp3', '.wav', '.ogg'], maxSize: 10 * 1024 * 1024, label: 'Audio (max 10MB)' },
  video: { extensions: ['.mp4', '.avi', '.mov', '.mkv'], maxSize: 50 * 1024 * 1024, label: 'Video (max 50MB)' },
  zip: { extensions: ['.zip', '.rar', '.7z'], maxSize: 20 * 1024 * 1024, label: 'ZIP (max 20MB)' },
  csv: { extensions: ['.csv'], maxSize: 5 * 1024 * 1024, label: 'CSV (max 5MB)' },
  text: { extensions: ['.txt'], maxSize: 1 * 1024 * 1024, label: 'Text (max 1MB)' },
  document: { extensions: ['.pdf', '.jpg', '.jpeg', '.png'], maxSize: 5 * 1024 * 1024, label: 'Document/Image (max 5MB)' },
  any: { extensions: [], maxSize: 5 * 1024 * 1024, label: 'Any File (max 5MB)' }
};

interface ValidatedFileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'accept'> {
  fileType?: FileType;
  onFileError?: (error: string | null) => void;
  wrapperClassName?: string;
  errorClassName?: string;
  infoClassName?: string;
  showMessages?: boolean;
  customExtensions?: string[];
  customMaxSize?: number;
  ref?: any;
}

export const ValidatedFileInput = forwardRef<HTMLInputElement, ValidatedFileInputProps>(({
  fileType = 'any',
  className = '',
  wrapperClassName = 'w-full',
  errorClassName = 'text-[10px] text-red-500 font-black uppercase mt-1',
  infoClassName = 'text-[10px] text-slate-500 font-bold uppercase mt-1',
  customExtensions,
  customMaxSize,
  showMessages,
  onChange,
  onFileError,
  style,
  id,
  name,
  ...props
}, ref) => {
  const [error, setError] = useState<string | null>(null);
  const config = FILE_TYPE_CONFIG[fileType];
  const maxSize = customMaxSize || config.maxSize;
  const extensions = customExtensions || config.extensions;

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds the limit of ${maxSize / (1024 * 1024) < 1 ? maxSize / 1024 + 'KB' : maxSize / (1024 * 1024) + 'MB'}.`;
    }
    
    if (extensions.length > 0) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!extensions.includes(extension)) {
        return `Invalid file format. Allowed formats: ${extensions.join(', ')}.`;
      }
    }
    
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    let validationError = null;

    if (file) {
      validationError = validateFile(file);
    }

    setError(validationError);
    if (onFileError) {
      onFileError(validationError);
    }

    if (onChange) {
      onChange(e);
    }
  };

  const acceptString = extensions.length > 0 ? extensions.join(',') : undefined;
  
  // To handle places where input is absolute/hidden and we still want to show messages,
  // we render them as siblings if wrapper is used.
  // We'll wrap in a React.Fragment if wrapperClassName is empty, else a div.
  
  const content = (
    <>
      <input
        ref={ref}
        type="file"
        id={id}
        name={name}
        accept={acceptString}
        className={`${className} ${error && !className.includes('opacity-0') && !className.includes('hidden') ? 'border-red-500' : ''}`}
        style={style}
        onChange={handleChange}
        {...props}
      />
      {(showMessages !== false && (showMessages === true || !(style?.display === 'none' || className.includes('hidden') || className.includes('opacity-0')))) && (
        <div className="flex flex-col mt-1">
          <span className={infoClassName}>
            Allowed: {extensions.length > 0 ? extensions.join(', ') : 'All'} | Max size: {maxSize / (1024 * 1024) < 1 ? maxSize / 1024 + 'KB' : maxSize / (1024 * 1024) + 'MB'}
          </span>
          {error && <span className={errorClassName}>{error}</span>}
        </div>
      )}
    </>
  );

  if (!wrapperClassName) return content;
  
  return (
    <div className={wrapperClassName}>
      {content}
    </div>
  );
});

ValidatedFileInput.displayName = 'ValidatedFileInput';

export default ValidatedFileInput;

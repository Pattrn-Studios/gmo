import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadContainer, UploadIcon, UploadText } from './styles';

interface Props {
  onImageUpload: (file: File) => void;
}

export function ImageUploadArea({ onImageUpload }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <UploadContainer {...getRootProps()} isDragActive={isDragActive}>
      <input {...getInputProps()} />
      <UploadIcon>🖼</UploadIcon>
      <UploadText>
        {isDragActive
          ? 'Drop your chart image here'
          : 'Drag & drop a chart image, or click to browse'
        }
      </UploadText>
      <UploadText small>
        Supported formats: PNG, JPG, JPEG, WebP (max 10MB)
      </UploadText>
    </UploadContainer>
  );
}

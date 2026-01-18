import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadContainer, UploadIcon, UploadText } from './styles';

interface Props {
  onFileUpload: (file: File) => void;
}

export function FileUploadArea({ onFileUpload }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <UploadContainer {...getRootProps()} isDragActive={isDragActive}>
      <input {...getInputProps()} />
      <UploadIcon>📊</UploadIcon>
      <UploadText>
        {isDragActive
          ? 'Drop your file here'
          : 'Drag & drop Excel or CSV file, or click to browse'
        }
      </UploadText>
      <UploadText small>
        Supported formats: .xlsx, .xls, .csv (max 10MB)
      </UploadText>
    </UploadContainer>
  );
}

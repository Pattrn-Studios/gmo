import styled from 'styled-components';

export const Container = styled.div`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

export const EditButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  background: ${props =>
    props.variant === 'danger' ? '#dc3545' :
    props.variant === 'secondary' ? '#6c757d' : '#3E7274'
  };
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ConfigSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  > div {
    font-size: 0.9rem;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    color: #132728;
  }

  button {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #6c757d;
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  min-height: 400px;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
`;

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop),
})<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.variant === 'secondary' ? '#6c757d' : '#3E7274'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const UploadContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDragActive'].includes(prop),
})<{ isDragActive?: boolean }>`
  border: 2px dashed ${props => props.isDragActive ? '#3E7274' : '#ccc'};
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3E7274;
    background: #f8f9fa;
  }
`;

export const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

export const UploadText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['small'].includes(prop),
})<{ small?: boolean }>`
  margin: 0.5rem 0;
  color: ${props => props.small ? '#6c757d' : '#132728'};
  font-size: ${props => props.small ? '0.85rem' : '1rem'};
`;

export const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e0e0e0;
    border-top-color: #3E7274;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  p {
    margin-top: 1rem;
    color: #6c757d;
  }
`;

export const ErrorMessage = styled.div`
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 1rem;

  strong {
    display: block;
    margin-bottom: 0.5rem;
  }
`;

export const PreviewContainer = styled.div`
  margin-bottom: 2rem;

  h3 {
    color: #132728;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
  }

  /* Container for the chart with proper background */
  > div:not(:first-child):not(:last-child) {
    background: #fafafa;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #e8e8e8;
  }
`;

export const ReasoningBox = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f8f8;
  border-left: 4px solid #3E7274;
  border-radius: 4px;

  strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #132728;
  }

  p {
    margin: 0;
    color: #495057;
    font-size: 0.9rem;
  }
`;

export const ThumbnailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

export const ThumbnailCard = styled.div`
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;

  &:hover {
    border-color: #3E7274;
    box-shadow: 0 4px 12px rgba(62, 114, 116, 0.12);
    transform: translateY(-2px);
  }

  span {
    display: block;
    text-align: center;
    margin-top: 8px;
    font-size: 0.85rem;
    color: #5F5F5F;
    font-weight: 500;
    text-transform: capitalize;
  }
`;

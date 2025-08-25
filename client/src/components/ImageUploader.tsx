import React, { useState, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  userId: string;
  maxImages?: number;
  disabled?: boolean;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

interface UploadedImage {
  id: string;
  url: string;
  path: string;
  originalName: string;
  size: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  userId,
  maxImages = 4,
  disabled = false,
  onError,
  onSuccess
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      if (onError) {
        onError(`Vous pouvez ajouter seulement ${remainingSlots} image(s) supplémentaire(s).`);
      }
      return;
    }

    // Vérifier les types de fichiers
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== fileArray.length) {
      if (onError) {
        onError("Seules les images sont autorisées.");
      }
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/images/upload/${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Échec de l\'upload');
      }

      const data = await response.json();
      
      if (data.success && data.images) {
        const newImageUrls = data.images.map((img: UploadedImage) => img.url);
        onImagesChange([...images, ...newImageUrls]);
        
        if (onSuccess) {
          onSuccess(data.message || `${data.images.length} image(s) uploadée(s) avec succès.`);
        }
      } else {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'upload');
      }
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, userId, onImagesChange, onError, onSuccess]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleUpload(event.target.files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    if (files) {
      handleUpload(files);
    }
  }, [disabled, uploading, handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragActive(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className="space-y-4">
      {/* Images existantes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-bolt-400 bg-primary-bolt-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="image-upload"
          />
          
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-primary-bolt-500 animate-spin" />
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {uploading ? 'Upload en cours...' : 'Ajouter des images'}
                </p>
                <p className="text-sm text-gray-500">
                  Glissez vos images ici ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {images.length}/{maxImages} images • Max 5MB par image • JPG, PNG, WEBP
                </p>
              </div>
            </div>
          </label>
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-gray-500 text-center">
          Limite de {maxImages} images atteinte
        </p>
      )}
    </div>
  );
};
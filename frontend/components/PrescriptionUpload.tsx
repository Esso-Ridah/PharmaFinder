import React, { useState, useCallback } from 'react';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface PrescriptionUploadProps {
  product: {
    id: string;
    name: string;
    requires_prescription: boolean;
  };
  pharmacy: {
    id: string;
    name: string;
  };
  quantity?: number;
  onSuccess?: (prescriptionRequestId: string) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({
  product,
  pharmacy,
  quantity = 1,
  onSuccess,
  onCancel,
  isOpen
}) => {
  const { user, isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [prescriptionRequestId, setPrescriptionRequestId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`fixed inset-0 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center bg-black bg-opacity-50`}>
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connexion requise
            </h3>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour commander des produits sur ordonnance.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <a
                href="/auth/login"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-center"
              >
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Type de fichier non autorisé. Utilisez JPG, PNG ou PDF.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error('Fichier trop volumineux. Taille maximum : 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('product_id', product.id);
      formData.append('pharmacy_id', pharmacy.id);
      formData.append('quantity_requested', quantity.toString());

      const response = await api.prescriptions.upload(formData);

      setUploadStatus('success');
      setPrescriptionRequestId(response.data.id);
      toast.success('Prescription envoyée pour validation');

      // Call success callback after a short delay to show success state
      setTimeout(() => {
        onSuccess?.(response.data.id);
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      const message = error.response?.data?.detail || 'Erreur lors de l\'envoi de la prescription';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <DocumentIcon className="h-8 w-8 text-red-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  if (uploadStatus === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Prescription envoyée !
            </h3>
            <p className="text-gray-600 mb-4">
              Votre prescription pour <strong>{product.name}</strong> a été envoyée à{' '}
              <strong>{pharmacy.name}</strong> pour validation.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">En attente de validation</p>
                  <p>Vous recevrez une notification une fois que la pharmacie aura validé votre prescription.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSuccess?.(prescriptionRequestId || '')}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
            >
              Continuer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                📋 Charger votre ordonnance
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Pour : {product.name} - {pharmacy.name}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
              disabled={uploading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordonnance médicale *
            </label>

            {!file ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  Glissez votre fichier ici ou{' '}
                  <label className="text-primary-600 cursor-pointer hover:text-primary-500">
                    parcourez
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileInputChange}
                      disabled={uploading}
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  Formats acceptés : JPG, PNG, PDF (max 10MB)
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-gray-500"
                    disabled={uploading}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Assurez-vous que l'ordonnance est lisible et contient toutes les informations nécessaires.
            </p>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité demandée
            </label>
            <input
              type="number"
              min="1"
              defaultValue={quantity}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={uploading}
            />
          </div>

          {/* Error State */}
          {uploadStatus === 'error' && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Erreur lors de l'envoi</p>
                  <p>Veuillez réessayer ou contacter le support.</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                'Envoyer pour validation'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;
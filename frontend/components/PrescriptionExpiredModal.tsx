import React, { useState, useEffect, useCallback } from 'react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface AlternativePharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  distance_km: number;
  latitude?: number;
  longitude?: number;
}

interface PrescriptionExpiredModalProps {
  isOpen: boolean;
  prescriptionRequest: {
    id: string;
    product?: {
      name: string;
    };
    pharmacy?: {
      name: string;
    };
  };
  onClose: () => void;
  onRetrySuccess: () => void;
  onContinueShopping: () => void;
}

const PrescriptionExpiredModal: React.FC<PrescriptionExpiredModalProps> = ({
  isOpen,
  prescriptionRequest,
  onClose,
  onRetrySuccess,
  onContinueShopping
}) => {
  const [alternatives, setAlternatives] = useState<AlternativePharmacy[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<AlternativePharmacy | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen && prescriptionRequest.id) {
      fetchAlternatives();
    }
  }, [isOpen, prescriptionRequest.id]);

  const fetchAlternatives = async () => {
    try {
      setLoadingAlternatives(true);
      const response = await api.prescriptions.getAlternatives(prescriptionRequest.id, 50, 10);
      setAlternatives(response.data);
    } catch (error: any) {
      console.error('Error fetching alternatives:', error);
      toast.error('Erreur lors de la recherche de pharmacies alternatives');
    } finally {
      setLoadingAlternatives(false);
    }
  };

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

  const handleRetryWithPharmacy = async (pharmacy: AlternativePharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowUploadForm(true);
  };

  const handleUpload = async () => {
    if (!file || !selectedPharmacy) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alternative_pharmacy_id', selectedPharmacy.id);
      formData.append('quantity_requested', quantity.toString());

      await api.prescriptions.retryWithAlternative(prescriptionRequest.id, formData);

      toast.success(`Prescription envoyée à ${selectedPharmacy.name} pour validation`);
      onRetrySuccess();
    } catch (error: any) {
      console.error('Retry error:', error);
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

  // Upload form view
  if (showUploadForm && selectedPharmacy) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  📋 Nouvelle tentative
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pour : {prescriptionRequest.product?.name} - {selectedPharmacy.name}
                </p>
              </div>
              <button
                onClick={() => setShowUploadForm(false)}
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
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité demandée
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={uploading}
              >
                Retour
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
                  'Envoyer'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main expired modal view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                ⏰ Prescription expirée
              </h3>
              <p className="text-gray-600 mt-1">
                La pharmacie <strong>{prescriptionRequest.pharmacy?.name}</strong> n'a malheureusement pas pris en charge votre demande de prescription pour{' '}
                <strong>{prescriptionRequest.product?.name}</strong> dans le délai imparti (15 minutes).
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Alternative pharmacies */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              🏥 Pharmacies alternatives disponibles
            </h4>

            {loadingAlternatives ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Recherche des pharmacies alternatives...</p>
              </div>
            ) : alternatives.length === 0 ? (
              <div className="text-center py-8">
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune pharmacie alternative trouvée dans votre région</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {alternatives.map((pharmacy) => (
                  <div key={pharmacy.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{pharmacy.name}</h5>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {pharmacy.address}, {pharmacy.city}
                        </div>
                        {pharmacy.phone && (
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {pharmacy.phone}
                          </div>
                        )}
                        <div className="text-sm text-primary-600 mt-1">
                          📍 À {pharmacy.distance_km.toFixed(1)} km
                        </div>
                      </div>
                      <button
                        onClick={() => handleRetryWithPharmacy(pharmacy)}
                        className="ml-4 px-3 py-1 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 text-sm font-medium"
                      >
                        Choisir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onContinueShopping}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Continuer mes achats
            </button>
            <button
              onClick={fetchAlternatives}
              disabled={loadingAlternatives}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Actualiser la liste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionExpiredModal;
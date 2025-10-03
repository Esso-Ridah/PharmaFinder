import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface PrescriptionRequest {
  id: string;
  user_id: string;
  product_id: string;
  pharmacy_id: string;
  prescription_image_url: string;
  original_filename: string;
  status: 'pending' | 'approved' | 'rejected';
  quantity_requested: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const PharmacistPrescriptions = () => {
  const { user, isAuthenticated } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionRequest | null>(null);
  const [validationModal, setValidationModal] = useState<{
    isOpen: boolean;
    prescription: PrescriptionRequest | null;
    action: 'approve' | 'reject' | null;
  }>({
    isOpen: false,
    prescription: null,
    action: null
  });
  const [validationForm, setValidationForm] = useState({
    pharmacist_notes: '',
    rejection_reason: ''
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'pharmacist') {
      return;
    }
    fetchPrescriptions();
  }, [isAuthenticated, user, filter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? undefined : filter;
      const response = await api.prescriptions.getPharmacyRequests(statusFilter);
      setPrescriptions(response.data);
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Erreur lors du chargement des prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {
    if (!validationModal.prescription || !validationModal.action) return;

    try {
      const validation = {
        prescription_request_id: validationModal.prescription.id,
        action: validationModal.action,
        pharmacist_notes: validationForm.pharmacist_notes,
        rejection_reason: validationModal.action === 'reject' ? validationForm.rejection_reason : undefined
      };

      await api.prescriptions.validate(validation);

      toast.success(`Prescription ${validationModal.action === 'approve' ? 'approuvée' : 'refusée'} avec succès`);

      // Close modal and refresh data
      setValidationModal({ isOpen: false, prescription: null, action: null });
      setValidationForm({ pharmacist_notes: '', rejection_reason: '' });
      await fetchPrescriptions();

    } catch (error: any) {
      console.error('Validation error:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  const openValidationModal = (prescription: PrescriptionRequest, action: 'approve' | 'reject') => {
    setValidationModal({ isOpen: true, prescription, action });
  };

  const closeValidationModal = () => {
    setValidationModal({ isOpen: false, prescription: null, action: null });
    setValidationForm({ pharmacist_notes: '', rejection_reason: '' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-amber-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Refusée';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Redirect if not pharmacist
  if (!isAuthenticated || user?.role !== 'pharmacist') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès restreint</h1>
          <p className="text-gray-600">Cette page est réservée aux pharmaciens.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Validation des prescriptions - PharmaFinder</title>
        <meta name="description" content="Gérer les demandes de prescription" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 mr-3" />
              Validation des prescriptions
            </h1>
            <p className="text-gray-600 mt-2">Gérer les demandes de prescription pour votre pharmacie</p>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {[
                { key: 'pending', label: 'En attente', count: prescriptions.filter(p => p.status === 'pending').length },
                { key: 'approved', label: 'Approuvées', count: prescriptions.filter(p => p.status === 'approved').length },
                { key: 'rejected', label: 'Refusées', count: prescriptions.filter(p => p.status === 'rejected').length },
                { key: 'all', label: 'Toutes', count: prescriptions.length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === key
                      ? 'bg-primary-100 text-primary-700 border-primary-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } border`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Prescriptions List */}
          <div className="bg-white shadow-sm rounded-lg">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des prescriptions...</p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="p-8 text-center">
                <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune prescription trouvée</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border-b border-gray-200 last:border-b-0 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getStatusIcon(prescription.status)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {getStatusText(prescription.status)}
                          </span>
                          <span className="ml-4 text-sm text-gray-500">
                            {formatDate(prescription.created_at)}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {prescription.product?.name}
                        </h3>

                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {prescription.user?.first_name} {prescription.user?.last_name}
                          <span className="ml-4">Quantité : {prescription.quantity_requested}</span>
                        </div>

                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Fichier:</span> {prescription.original_filename}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedPrescription(prescription)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Voir l'ordonnance"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>

                        {prescription.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openValidationModal(prescription, 'approve')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => openValidationModal(prescription, 'reject')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription View Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Ordonnance - {selectedPrescription.product?.name}</h3>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="text-center">
                {selectedPrescription.prescription_image_url.endsWith('.pdf') ? (
                  <embed
                    src={`http://localhost:8001${selectedPrescription.prescription_image_url}`}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                    className="border rounded"
                  />
                ) : (
                  <img
                    src={`http://localhost:8001${selectedPrescription.prescription_image_url}`}
                    alt="Ordonnance"
                    className="max-w-full h-auto border rounded"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {validationModal.isOpen && validationModal.prescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {validationModal.action === 'approve' ? 'Approuver' : 'Refuser'} la prescription
              </h3>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="font-medium">{validationModal.prescription.product?.name}</p>
                <p className="text-sm text-gray-600">
                  Client: {validationModal.prescription.user?.first_name} {validationModal.prescription.user?.last_name}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes du pharmacien (optionnel)
                  </label>
                  <textarea
                    value={validationForm.pharmacist_notes}
                    onChange={(e) => setValidationForm({ ...validationForm, pharmacist_notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ajoutez vos commentaires..."
                  />
                </div>

                {validationModal.action === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison du refus *
                    </label>
                    <textarea
                      value={validationForm.rejection_reason}
                      onChange={(e) => setValidationForm({ ...validationForm, rejection_reason: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Expliquez la raison du refus..."
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={closeValidationModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValidation}
                  disabled={validationModal.action === 'reject' && !validationForm.rejection_reason.trim()}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${
                    validationModal.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                >
                  {validationModal.action === 'approve' ? 'Approuver' : 'Refuser'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PharmacistPrescriptions;
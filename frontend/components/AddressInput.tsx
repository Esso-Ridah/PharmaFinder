import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface AddressInputProps {
  onAddressChange: (address: AddressData) => void;
  initialAddress?: AddressData;
}

interface AddressData {
  label: string;
  address_type: 'modern' | 'description' | 'gps';

  // Adresse moderne (optionnel)
  street_address?: string;
  neighborhood?: string;
  city: string;

  // Description/Points de repère (optionnel)
  landmark_description?: string;

  // Coordonnées GPS (optionnel)
  latitude?: number;
  longitude?: number;

  // Contact pour livraison
  delivery_phone?: string;
  delivery_instructions?: string;
}

const AddressInput: React.FC<AddressInputProps> = ({ onAddressChange, initialAddress }) => {
  const [addressType, setAddressType] = useState<'modern' | 'description' | 'gps'>(
    initialAddress?.address_type || 'modern'
  );

  const [formData, setFormData] = useState<AddressData>({
    label: initialAddress?.label || '',
    address_type: addressType,
    city: initialAddress?.city || '',
    street_address: initialAddress?.street_address || '',
    neighborhood: initialAddress?.neighborhood || '',
    landmark_description: initialAddress?.landmark_description || '',
    latitude: initialAddress?.latitude,
    longitude: initialAddress?.longitude,
    delivery_phone: initialAddress?.delivery_phone || '',
    delivery_instructions: initialAddress?.delivery_instructions || '',
  });

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    onAddressChange(formData);
  }, [formData, onAddressChange]);

  const handleInputChange = (field: keyof AddressData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
          address_type: 'gps'
        }));
        setAddressType('gps');
        setLocationStatus('success');
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Autorisation de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai de géolocalisation dépassé';
            break;
        }
        setLocationError(errorMessage);
        setLocationStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const addressTypeOptions = [
    {
      id: 'modern',
      title: 'Adresse classique',
      description: 'Nom de rue, quartier, ville',
      icon: BuildingOfficeIcon
    },
    {
      id: 'description',
      title: 'Points de repère',
      description: 'Description avec lieux connus',
      icon: GlobeAltIcon
    },
    {
      id: 'gps',
      title: 'Position GPS',
      description: 'Coordonnées exactes',
      icon: MapPinIcon
    }
  ];

  return (
    <div className="space-y-6">
      {/* Nom de l'adresse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'adresse (ex: Maison, Bureau)
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => handleInputChange('label', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Maison, Bureau, Chez Maman..."
        />
      </div>

      {/* Type d'adresse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Comment souhaitez-vous indiquer votre adresse ?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {addressTypeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.id}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  addressType === option.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="address_type"
                  value={option.id}
                  checked={addressType === option.id}
                  onChange={(e) => {
                    const type = e.target.value as 'modern' | 'description' | 'gps';
                    setAddressType(type);
                    setFormData(prev => ({ ...prev, address_type: type }));
                  }}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <Icon className={`h-6 w-6 mr-3 ${
                    addressType === option.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      addressType === option.id ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {option.title}
                    </p>
                    <p className={`text-xs ${
                      addressType === option.id ? 'text-primary-700' : 'text-gray-500'
                    }`}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Ville (toujours requis) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ville <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Abidjan, Douala, Lagos, Dakar..."
          required
        />
      </div>

      {/* Champs spécifiques selon le type d'adresse */}
      {addressType === 'modern' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quartier/Zone
            </label>
            <input
              type="text"
              value={formData.neighborhood || ''}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Plateau, Cocody, Adjamé..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse complète
            </label>
            <input
              type="text"
              value={formData.street_address || ''}
              onChange={(e) => handleInputChange('street_address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Rue, avenue, immeuble, étage, appartement..."
            />
          </div>
        </div>
      )}

      {addressType === 'description' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description avec points de repère
          </label>
          <textarea
            value={formData.landmark_description || ''}
            onChange={(e) => handleInputChange('landmark_description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ex: Près de l'école Sainte Marie, après la station Total, maison bleue à gauche, portail vert..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Décrivez votre localisation avec des lieux connus, bâtiments remarquables, commerces...
          </p>
        </div>
      )}

      {addressType === 'gps' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationStatus === 'loading'}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {locationStatus === 'loading' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Localisation en cours...
                </>
              ) : (
                <>
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Partager ma position
                </>
              )}
            </button>
          </div>

          {locationStatus === 'success' && formData.latitude && formData.longitude && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Position enregistrée</p>
                  <p className="text-green-600">
                    Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {locationStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Erreur de géolocalisation</p>
                  <p className="text-red-600">{locationError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Partage de position GPS</p>
                <p className="mt-1">
                  Cliquez sur "Partager ma position" pour permettre au livreur de vous localiser précisément.
                  Votre navigateur vous demandera l'autorisation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Téléphone pour livraison */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone pour livraison <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            value={formData.delivery_phone}
            onChange={(e) => handleInputChange('delivery_phone', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="+225 07 XX XX XX XX"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Le livreur vous contactera sur ce numéro
        </p>
      </div>

      {/* Instructions supplémentaires */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions pour le livreur (optionnel)
        </label>
        <textarea
          value={formData.delivery_instructions || ''}
          onChange={(e) => handleInputChange('delivery_instructions', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Ex: Sonner 2 fois, demander Kofi, livrer après 18h, laisser avec le gardien..."
        />
      </div>
    </div>
  );
};

export default AddressInput;
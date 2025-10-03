import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { api, Pharmacy } from '../lib/api';
import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PharmacyWithDistance extends Pharmacy {
  distance_km?: number;
}

const CartePage: NextPage = () => {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<PharmacyWithDistance[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithDistance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      const response = await api.pharmacies.list({ verified_only: true });
      setPharmacies(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProducts = () => {
    if (selectedPharmacy) {
      router.push(`/pharmacies/${selectedPharmacy.id}`);
    }
  };

  const handleGetDirections = () => {
    if (selectedPharmacy && selectedPharmacy.latitude && selectedPharmacy.longitude) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.latitude},${selectedPharmacy.longitude}&destination_place_id=${encodeURIComponent(selectedPharmacy.name)}`;
      window.open(googleMapsUrl, '_blank');
    } else if (selectedPharmacy && selectedPharmacy.address) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPharmacy.address + ', ' + (selectedPharmacy.city || 'Lomé'))}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <>
      <Head>
        <title>Carte des Pharmacies - PharmaFinder</title>
        <meta name="description" content="Trouvez les pharmacies partenaires près de chez vous" />
      </Head>


      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Vue sur carte</h1>
              <p className="mt-2 text-gray-600">
                Trouvez les pharmacies partenaires près de chez vous
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone carte */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-96 lg:h-[600px] relative">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=1.1800%2C6.1100%2C1.2700%2C6.1700&layer=mapnik&marker=6.1319%2C1.2228"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  title="Carte des pharmacies de Lomé"
                  className="rounded-lg"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <MapPinIcon className="h-4 w-4 mr-2 text-blue-600" />
                    Lomé, Togo
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des pharmacies */}
            <div className="space-y-6">
              {selectedPharmacy && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedPharmacy.name}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">{selectedPharmacy.address}</p>
                        <p className="text-gray-600">{selectedPharmacy.city}</p>
                      </div>
                    </div>

                    {selectedPharmacy.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="text-gray-900">{selectedPharmacy.phone}</p>
                      </div>
                    )}

                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <p className="text-gray-900">Voir horaires</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleViewProducts}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Voir les produits
                    </button>
                    <button
                      onClick={handleGetDirections}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Itinéraire
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pharmacies partenaires ({pharmacies.length})
                  </h3>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Chargement...</p>
                    </div>
                  ) : (
                    pharmacies.map((pharmacy) => (
                      <button
                        key={pharmacy.id}
                        onClick={() => setSelectedPharmacy(pharmacy)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          selectedPharmacy?.id === pharmacy.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                        }`}
                      >
                        <h4 className="font-medium text-gray-900">{pharmacy.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{pharmacy.city}</span>
                          {pharmacy.is_verified && (
                            <span className="text-xs font-medium text-green-600">Vérifiée</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartePage;
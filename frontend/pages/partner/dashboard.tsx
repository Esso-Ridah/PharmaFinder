import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// import { useAuth, withAuth } from '../../hooks/useAuth';
import { api, Pharmacy } from '../../lib/api';
import PartnerLayout from '../../components/PartnerLayout';

interface PharmacyForm {
  name: string;
  license_number: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  opening_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

const PartnerDashboard: NextPage = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PharmacyForm>({
    defaultValues: {
      opening_hours: {
        monday: '08:00-18:00',
        tuesday: '08:00-18:00',
        wednesday: '08:00-18:00',
        thursday: '08:00-18:00',
        friday: '08:00-18:00',
        saturday: '08:00-13:00',
        sunday: 'Fermé',
      },
    },
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'pharmacist') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      router.push('/auth/login');
      return;
    }
    
    setAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (user && !authLoading) {
      loadPharmacyData();
    }
  }, [user, authLoading]);

  const loadPharmacyData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Pour la démo, simuler une pharmacie existante
      const mockPharmacy: Pharmacy = {
        id: '90beaf0f-d45a-460f-9540-2d41ab596990',
        name: 'Pharmacie Centrale de Lomé',
        license_number: 'PH-LOME-2024-001',
        owner_id: user.id,
        address: 'Avenue du 24 Janvier, près du marché central',
        city: 'Lomé',
        country: 'Togo',
        phone: '+228 22 00 00 00',
        email: 'contact@pharmaciecentrale.tg',
        opening_hours: {
          monday: '08:00-18:00',
          tuesday: '08:00-18:00',
          wednesday: '08:00-18:00',
          thursday: '08:00-18:00',
          friday: '08:00-18:00',
          saturday: '08:00-13:00',
          sunday: 'Fermé',
        },
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      
      setPharmacy(mockPharmacy);
      
      // Remplir le formulaire avec les données simulées
      reset({
        name: mockPharmacy.name,
        license_number: mockPharmacy.license_number,
        address: mockPharmacy.address,
        city: mockPharmacy.city,
        phone: mockPharmacy.phone || '',
        email: mockPharmacy.email || '',
        opening_hours: mockPharmacy.opening_hours || {
          monday: '08:00-18:00',
          tuesday: '08:00-18:00',
          wednesday: '08:00-18:00',
          thursday: '08:00-18:00',
          friday: '08:00-18:00',
          saturday: '08:00-13:00',
          sunday: 'Fermé',
        },
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PharmacyForm) => {
    setSaving(true);
    try {
      if (pharmacy) {
        // Mettre à jour la pharmacie existante
        toast.success('Pharmacie mise à jour avec succès !');
      } else {
        // Créer une nouvelle pharmacie
        const newPharmacy = {
          ...data,
          owner_id: user!.id,
          latitude: 6.1319, // Coordonnées par défaut pour Lomé
          longitude: 1.2228,
          is_active: true,
          is_verified: false, // Sera vérifiée par l'admin
        };
        
        // TODO: Appeler l'API pour créer la pharmacie
        toast.success('Pharmacie créée avec succès ! Elle sera vérifiée sous peu.');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Dashboard Partenaire - PharmaFinder</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <PartnerLayout>
      <Head>
        <title>Dashboard Partenaire - PharmaFinder</title>
        <meta name="description" content="Gérez votre pharmacie partenaire" />
      </Head>

      <div className="bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Bienvenue {user?.first_name}, gérez votre activité
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {pharmacy?.is_verified ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Vérifiée
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      En attente
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {!pharmacy ? (
            /* Première configuration */
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center mb-8">
                <BuildingStorefrontIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Configurez votre pharmacie
                </h2>
                <p className="text-gray-600">
                  Remplissez les informations de votre pharmacie pour rejoindre notre réseau de partenaires
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom de la pharmacie */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la pharmacie *
                    </label>
                    <input
                      {...register('name', { required: 'Le nom est requis' })}
                      type="text"
                      className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                      placeholder="Ex: Pharmacie Centrale de Lomé"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Numéro de licence */}
                  <div>
                    <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de licence *
                    </label>
                    <input
                      {...register('license_number', { required: 'Le numéro de licence est requis' })}
                      type="text"
                      className={`input-field ${errors.license_number ? 'border-red-300' : ''}`}
                      placeholder="Ex: PH-LOME-2024-001"
                    />
                    {errors.license_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.license_number.message}</p>
                    )}
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <textarea
                    {...register('address', { required: 'L\'adresse est requise' })}
                    rows={3}
                    className={`input-field resize-none ${errors.address ? 'border-red-300' : ''}`}
                    placeholder="Ex: Avenue du 24 Janvier, près du marché central"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ville */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      {...register('city', { required: 'La ville est requise' })}
                      type="text"
                      className={`input-field ${errors.city ? 'border-red-300' : ''}`}
                      placeholder="Lomé"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input-field"
                      placeholder="+228 22 00 00 00"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email de la pharmacie
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="input-field"
                      placeholder="contact@pharmacie.tg"
                    />
                  </div>
                </div>

                {/* Horaires d'ouverture */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Horaires d'ouverture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries({
                      monday: 'Lundi',
                      tuesday: 'Mardi',
                      wednesday: 'Mercredi',
                      thursday: 'Jeudi',
                      friday: 'Vendredi',
                      saturday: 'Samedi',
                      sunday: 'Dimanche',
                    }).map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label}
                        </label>
                        <input
                          {...register(`opening_hours.${key as keyof PharmacyForm['opening_hours']}`)}
                          type="text"
                          className="input-field"
                          placeholder="08:00-18:00"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton de soumission */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="loading-spinner mr-2"></div>
                        Enregistrement...
                      </div>
                    ) : (
                      'Enregistrer ma pharmacie'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Pharmacie existante */
            <div className="space-y-8">
              {/* Informations de la pharmacie */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Informations de la pharmacie</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn-secondary flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                </div>

                <div className="p-6">
                  {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Formulaire de modification similaire à celui du dessus */}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pharmacy.name}</p>
                            <p className="text-sm text-gray-600">Licence: {pharmacy.license_number}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-900">{pharmacy.address}</p>
                            <p className="text-sm text-gray-600">{pharmacy.city}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {pharmacy.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <p className="text-sm text-gray-900">{pharmacy.phone}</p>
                          </div>
                        )}

                        {pharmacy.email && (
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <p className="text-sm text-gray-900">{pharmacy.email}</p>
                          </div>
                        )}

                        <div className="flex items-start">
                          <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Horaires d'ouverture</p>
                            <p className="text-sm text-gray-600">Lun-Ven: 8h-18h</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Statistiques</h3>
                      <p className="text-sm text-gray-600">Ventes & performances</p>
                    </div>
                  </div>
                  <Link href="/partner/analytics" className="btn-primary w-full mt-4 inline-block text-center">
                    Voir les stats
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <CubeIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Stocks</h3>
                      <p className="text-sm text-gray-600">Inventaire & produits</p>
                    </div>
                  </div>
                  <Link href="/partner/inventory" className="btn-primary w-full mt-4 inline-block text-center">
                    Gérer l'inventaire
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <ShoppingCartIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Commandes</h3>
                      <p className="text-sm text-gray-600">Nouvelles & en cours</p>
                    </div>
                  </div>
                  <Link href="/partner/tickets" className="btn-primary w-full mt-4 inline-block text-center">
                    Voir tickets
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <BuildingStorefrontIcon className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Ma Pharmacie</h3>
                      <p className="text-sm text-gray-600">Profil & informations</p>
                    </div>
                  </div>
                  <Link href="/partner/profile" className="btn-primary w-full mt-4 inline-block text-center">
                    Modifier infos
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerDashboard;
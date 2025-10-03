import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  QuestionMarkCircleIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  BookOpenIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

import PartnerLayout from '../../components/PartnerLayout';

const PartnerSupport: NextPage = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

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

  const [selectedCategory, setSelectedCategory] = useState('general');

  const supportCategories = [
    { id: 'general', name: 'Questions générales', icon: QuestionMarkCircleIcon },
    { id: 'technical', name: 'Problèmes techniques', icon: ComputerDesktopIcon },
    { id: 'account', name: 'Gestion de compte', icon: UserGroupIcon },
    { id: 'orders', name: 'Gestion des commandes', icon: DocumentTextIcon },
  ];

  const recentTickets = [
    {
      id: 'SUP001',
      subject: 'Configuration de la pharmacie',
      category: 'account',
      status: 'resolved',
      created: '2025-01-15',
      lastReply: '2025-01-16',
      admin: 'Support Admin',
    },
    {
      id: 'SUP002',
      subject: 'Problème de synchronisation des stocks',
      category: 'technical',
      status: 'in_progress',
      created: '2025-01-14',
      lastReply: '2025-01-16',
      admin: 'Tech Support',
    },
    {
      id: 'SUP003',
      subject: 'Question sur les commissions',
      category: 'general',
      status: 'open',
      created: '2025-01-13',
      lastReply: '2025-01-13',
      admin: 'Pending assignment',
    },
  ];

  const faqItems = [
    {
      category: 'general',
      question: 'Comment configurer ma pharmacie sur la plateforme ?',
      answer: 'Pour configurer votre pharmacie, allez dans "Mes Infos" puis cliquez sur "Configurer ma pharmacie". Renseignez toutes les informations demandées incluant l\'adresse, les horaires, et les informations de contact.',
    },
    {
      category: 'general',
      question: 'Comment sont calculées les commissions ?',
      answer: 'Les commissions sont calculées sur le montant HT de chaque vente. Le taux varie selon votre volume de ventes mensuel. Plus vous vendez, plus le taux est avantageux.',
    },
    {
      category: 'technical',
      question: 'Problème de connexion à mon compte',
      answer: 'Si vous ne pouvez pas vous connecter, vérifiez d\'abord votre email et mot de passe. Si le problème persiste, utilisez la fonction "Mot de passe oublié" ou contactez le support.',
    },
    {
      category: 'technical',
      question: 'La synchronisation des stocks ne fonctionne pas',
      answer: 'La synchronisation peut prendre jusqu\'à 15 minutes. Si le problème persiste après ce délai, vérifiez votre connexion internet et contactez le support technique.',
    },
    {
      category: 'account',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Allez dans "Mes Infos" pour modifier vos informations personnelles. Certaines modifications peuvent nécessiter une validation par notre équipe.',
    },
    {
      category: 'orders',
      question: 'Comment gérer les annulations de commandes ?',
      answer: 'Les demandes d\'annulation apparaissent dans la section "Tickets". Vous pouvez accepter ou refuser selon votre politique de vente et le délai de la demande.',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-red-100 text-red-800', icon: ExclamationCircleIcon, text: 'Ouvert' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, text: 'En cours' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Résolu' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };


  if (authLoading) {
    return (
      <>
        <Head>
          <title>Aide et Support - PharmaFinder Partenaire</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  const filteredFaq = faqItems.filter(item => 
    selectedCategory === 'general' || item.category === selectedCategory
  );

  return (
    <PartnerLayout>
      <Head>
        <title>Aide et Support - PharmaFinder Partenaire</title>
        <meta name="description" content="Obtenez de l'aide et contactez le support admin" />
      </Head>

      <div className="bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <QuestionMarkCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Aide et Support</h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Obtenez de l'aide et contactez notre équipe de support
                    </p>
                  </div>
                </div>
                <button className="btn-primary flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nouveau ticket de support
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact rapide */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact rapide</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <PhoneIcon className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Support téléphonique</div>
                      <div className="text-sm text-gray-600">+225 XX XX XX XX</div>
                      <div className="text-xs text-gray-500">Lun-Ven 8h-18h</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Email</div>
                      <div className="text-sm text-gray-600">support@pharmafinder.ci</div>
                      <div className="text-xs text-gray-500">Réponse sous 24h</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Chat en direct</div>
                      <div className="text-sm text-gray-600">Support instantané</div>
                      <div className="text-xs text-gray-500">Lun-Ven 8h-20h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mes tickets récents */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mes tickets récents</h3>
                <div className="space-y-3">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">#{ticket.id}</span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{ticket.subject}</div>
                      <div className="text-xs text-gray-500">
                        Créé le {ticket.created} • {ticket.admin}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ et documentation */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Questions fréquentes</h3>
                  <BookOpenIcon className="h-5 w-5 text-gray-400" />
                </div>

                {/* Catégories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {supportCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {category.name}
                      </button>
                    );
                  })}
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                  {filteredFaq.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          {item.question}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documentation utile */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documentation utile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600 mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Guide de démarrage</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Découvrez comment configurer votre pharmacie et commencer à vendre
                    </p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                      Lire le guide →
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <BookOpenIcon className="h-8 w-8 text-green-600 mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Bonnes pratiques</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Conseils pour optimiser vos ventes et satisfaire vos clients
                    </p>
                    <button className="text-green-600 text-sm font-medium hover:text-green-800">
                      Voir les conseils →
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <ComputerDesktopIcon className="h-8 w-8 text-purple-600 mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Documentation API</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Intégrez nos APIs pour automatiser votre gestion
                    </p>
                    <button className="text-purple-600 text-sm font-medium hover:text-purple-800">
                      Voir la doc API →
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <UserGroupIcon className="h-8 w-8 text-orange-600 mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Communauté</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Échangez avec d'autres pharmaciens partenaires
                    </p>
                    <button className="text-orange-600 text-sm font-medium hover:text-orange-800">
                      Rejoindre →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerSupport;
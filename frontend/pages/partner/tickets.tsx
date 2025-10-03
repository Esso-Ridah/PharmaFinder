import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  TicketIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

import PartnerLayout from '../../components/PartnerLayout';

const PartnerTickets: NextPage = () => {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const ticketTypes = [
    { id: 'all', name: 'Tous les types' },
    { id: 'complaint', name: 'Réclamation client' },
    { id: 'cancellation', name: 'Annulation' },
    { id: 'conflict', name: 'Conflit' },
    { id: 'product_issue', name: 'Problème produit' },
    { id: 'delivery', name: 'Livraison' },
  ];

  const ticketStatuses = [
    { id: 'all', name: 'Tous les statuts' },
    { id: 'open', name: 'Ouvert' },
    { id: 'in_progress', name: 'En cours' },
    { id: 'waiting', name: 'En attente' },
    { id: 'resolved', name: 'Résolu' },
    { id: 'closed', name: 'Fermé' },
  ];

  const tickets = [
    {
      id: 'T001',
      title: 'Produit défectueux reçu',
      type: 'complaint',
      status: 'open',
      priority: 'high',
      customer: 'Marie Dubois',
      customerEmail: 'marie.dubois@email.com',
      createdAt: '2025-01-16',
      lastUpdate: '2025-01-16',
      description: 'Le client a reçu un médicament avec l\'emballage endommagé',
      messages: 3,
    },
    {
      id: 'T002',
      title: 'Demande d\'annulation de commande',
      type: 'cancellation',
      status: 'in_progress',
      priority: 'medium',
      customer: 'Jean Martin',
      customerEmail: 'jean.martin@email.com',
      createdAt: '2025-01-15',
      lastUpdate: '2025-01-16',
      description: 'Client souhaite annuler sa commande #CMD123',
      messages: 5,
    },
    {
      id: 'T003',
      title: 'Retard de livraison',
      type: 'delivery',
      status: 'resolved',
      priority: 'low',
      customer: 'Sophie Laurent',
      customerEmail: 'sophie.laurent@email.com',
      createdAt: '2025-01-14',
      lastUpdate: '2025-01-15',
      description: 'Commande livrée avec 2 jours de retard',
      messages: 8,
    },
    {
      id: 'T004',
      title: 'Conflit sur le prix facturé',
      type: 'conflict',
      status: 'waiting',
      priority: 'high',
      customer: 'Pierre Rousseau',
      customerEmail: 'pierre.rousseau@email.com',
      createdAt: '2025-01-13',
      lastUpdate: '2025-01-14',
      description: 'Différence entre le prix affiché et le prix facturé',
      messages: 12,
    },
    {
      id: 'T005',
      title: 'Produit non conforme à la description',
      type: 'product_issue',
      status: 'closed',
      priority: 'medium',
      customer: 'Anne Moreau',
      customerEmail: 'anne.moreau@email.com',
      createdAt: '2025-01-12',
      lastUpdate: '2025-01-13',
      description: 'Le produit reçu ne correspond pas à la description en ligne',
      messages: 6,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'Ouvert' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, text: 'En cours' },
      waiting: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'En attente' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Résolu' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, text: 'Fermé' },
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { color: 'bg-red-100 text-red-800', text: 'Haute' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Moyenne' },
      low: { color: 'bg-gray-100 text-gray-800', text: 'Basse' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    return ticketTypes.find(t => t.id === type)?.name || type;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesType = selectedType === 'all' || ticket.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });


  if (authLoading) {
    return (
      <>
        <Head>
          <title>Gestion des Tickets - PharmaFinder Partenaire</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  const stats = [
    {
      name: 'Total tickets',
      value: tickets.length.toString(),
      description: 'Tous les tickets',
    },
    {
      name: 'Ouverts',
      value: tickets.filter(t => t.status === 'open').length.toString(),
      description: 'Nécessitent attention',
    },
    {
      name: 'En cours',
      value: tickets.filter(t => t.status === 'in_progress').length.toString(),
      description: 'En traitement',
    },
    {
      name: 'Résolus',
      value: tickets.filter(t => t.status === 'resolved').length.toString(),
      description: 'Problèmes réglés',
    },
  ];

  return (
    <PartnerLayout>
      <Head>
        <title>Gestion des Tickets - PharmaFinder Partenaire</title>
        <meta name="description" content="Gérez les réclamations, conflits et tickets clients" />
      </Head>

      <div className="bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TicketIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Tickets</h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Gérez les réclamations, conflits et tickets clients
                    </p>
                  </div>
                </div>
                <button className="btn-primary flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nouveau ticket
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.name}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un ticket, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  {ticketStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  {ticketTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Tickets ({filteredTickets.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière MAJ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{ticket.id}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {ticket.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.customer}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTypeLabel(ticket.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          {ticket.messages}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.lastUpdate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900 flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerTickets;
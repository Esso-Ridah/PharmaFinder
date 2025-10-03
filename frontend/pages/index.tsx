import React from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingCartIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
// import { motion } from 'framer-motion'; // Temporarily disabled

import UnifiedSearchBar from '../components/UnifiedSearchBar';

const features = [
  {
    name: 'Recherche intelligente',
    description: 'Trouvez rapidement vos médicaments par nom, principe actif ou maladie',
    icon: MagnifyingGlassIcon,
    color: 'bg-primary-500',
  },
  {
    name: 'Géolocalisation',
    description: 'Localisez les pharmacies les plus proches de chez vous',
    icon: MapPinIcon,
    color: 'bg-secondary-500',
  },
  {
    name: 'Commande en ligne',
    description: 'Click & collect ou livraison à domicile selon vos préférences',
    icon: ShoppingCartIcon,
    color: 'bg-success-500',
  },
  {
    name: 'Disponibilité temps réel',
    description: 'Vérifiez la disponibilité des produits avant de vous déplacer',
    icon: ClockIcon,
    color: 'bg-warning-500',
  },
  {
    name: 'Pharmacies vérifiées',
    description: 'Toutes nos pharmacies partenaires sont certifiées et vérifiées',
    icon: ShieldCheckIcon,
    color: 'bg-error-500',
  },
  {
    name: 'Support client',
    description: 'Une équipe dédiée pour vous accompagner 24h/24',
    icon: UserGroupIcon,
    color: 'bg-purple-500',
  },
];

const stats = [
  { label: 'Pharmacies partenaires', value: '50+' },
  { label: 'Médicaments référencés', value: '10,000+' },
  { label: 'Commandes traitées', value: '5,000+' },
  { label: 'Clients satisfaits', value: '2,000+' },
];

const testimonials = [
  {
    id: 1,
    content: "PharmaFinder m'a sauvé du temps précieux. Plus besoin de parcourir la ville pour trouver un médicament !",
    author: {
      name: 'Kofi Asante',
      role: 'Client',
      location: 'Lomé, Togo',
    },
  },
  {
    id: 2,
    content: "Excellente plateforme ! Je peux maintenant gérer ma pharmacie plus efficacement et servir plus de clients.",
    author: {
      name: 'Dr. Fatima Alassane',
      role: 'Pharmacienne',
      location: 'Lomé, Togo',
    },
  },
  {
    id: 3,
    content: "La géolocalisation et la vérification des stocks sont parfaites. Une révolution pour l'accès aux soins !",
    author: {
      name: 'Ama Kone',
      role: 'Client',
      location: 'Lomé, Togo',
    },
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <div>
              <h1 className="text-4xl tracking-tight font-display font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                Trouvez vos{' '}
                <span className="text-gradient">médicaments</span>
                {' '}rapidement
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 sm:text-xl">
                La première plateforme de référencement des pharmacies en Afrique de l'Ouest. 
                Recherchez, localisez et commandez vos médicaments en toute simplicité.
              </p>
            </div>

            {/* Unified Search Bar */}
            <div className="mt-8 max-w-4xl mx-auto">
              <UnifiedSearchBar
                placeholder="Recherchez un médicament, une pharmacie ou une localité..."
                prominent={true}
              />
            </div>


            {/* CTA Buttons */}
            <div
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/pharmacies" className="btn-primary btn-lg">
                Trouver une pharmacie
              </Link>
              <Link href="/how-it-works" className="btn-outline btn-lg">
                Comment ça marche
              </Link>
            </div>

            {/* Trust Indicators */}
            <div
              className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500"
            >
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-success-500 mr-1" />
                <span>Pharmacies vérifiées</span>
              </div>
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-primary-500 mr-1" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-secondary-500 mr-1" />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-gray-500 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
            >
              <h2 className="text-3xl font-display font-bold text-gray-900 sm:text-4xl">
                Une solution complète pour vos besoins pharmaceutiques
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                PharmaFinder révolutionne l'accès aux médicaments en Afrique de l'Ouest
              </p>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className="card card-hover card-body text-center"
                >
                  <div className="flex justify-center">
                    <div className={`${feature.color} p-3 rounded-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
            >
              <h2 className="text-3xl font-display font-bold text-gray-900 sm:text-4xl">
                Comment ça marche ?
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                En seulement 3 étapes simples
              </p>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Recherchez votre médicament',
                  description: 'Utilisez notre moteur de recherche pour trouver le médicament dont vous avez besoin',
                  icon: MagnifyingGlassIcon,
                },
                {
                  step: '02',
                  title: 'Choisissez votre pharmacie',
                  description: 'Sélectionnez la pharmacie la plus proche avec le meilleur prix',
                  icon: MapPinIcon,
                },
                {
                  step: '03',
                  title: 'Commandez et récupérez',
                  description: 'Passez commande en ligne et choisissez entre retrait ou livraison',
                  icon: ShoppingCartIcon,
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-primary-100 rounded-full">
                      <item.icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/how-it-works" className="btn-primary">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-primary-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
            >
              <h2 className="text-3xl font-display font-bold text-gray-900 sm:text-4xl">
                Ce que disent nos utilisateurs
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Découvrez les témoignages de nos clients et partenaires
              </p>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="card card-body"
                >
                  <blockquote>
                    <p className="text-gray-700 italic">
                      "{testimonial.content}"
                    </p>
                  </blockquote>
                  <div className="mt-6 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {testimonial.author.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {testimonial.author.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonial.author.role} • {testimonial.author.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
          <div className="text-center">
            <div
            >
              <h2 className="text-3xl font-display font-bold text-white sm:text-4xl">
                Prêt à commencer ?
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Rejoignez des milliers d'utilisateurs qui font confiance à PharmaFinder
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="btn-secondary btn-lg">
                  Créer un compte
                </Link>
                <Link href="/pharmacies" className="btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary-600">
                  Explorer les pharmacies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
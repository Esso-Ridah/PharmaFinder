import React from 'react';
import Link from 'next/link';
import {
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  MapPinIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import Head from 'next/head';

const stats = [
  { label: 'Pharmacies partenaires', value: '50+', icon: ShieldCheckIcon },
  { label: 'Médicaments référencés', value: '10,000+', icon: ChartBarIcon },
  { label: 'Commandes traitées', value: '5,000+', icon: UserGroupIcon },
  { label: 'Villes couvertes', value: '3', icon: MapPinIcon },
];

const team = [
  {
    name: 'Dr. Kofi Mensah',
    role: 'Co-fondateur & CEO',
    bio: 'Pharmacien avec 15 ans d\'expérience, pionnier de la digitalisation pharmaceutique en Afrique de l\'Ouest.',
    avatar: '👨‍⚕️',
  },
  {
    name: 'Ama Asante',
    role: 'Co-fondatrice & CTO',
    bio: 'Ingénieure logiciel passionnée par l\'innovation technologique au service de la santé.',
    avatar: '👩‍💻',
  },
  {
    name: 'Dr. Fatima Kone',
    role: 'Directrice Médicale',
    bio: 'Médecin généraliste engagée pour l\'amélioration de l\'accès aux soins en Afrique.',
    avatar: '👩‍⚕️',
  },
];

const values = [
  {
    icon: HeartIcon,
    title: 'Impact Social',
    description: 'Notre mission est d\'améliorer l\'accès aux médicaments et de sauver des vies en Afrique de l\'Ouest.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Sécurité',
    description: 'Nous garantissons la qualité et l\'authenticité de tous les médicaments via nos pharmacies vérifiées.',
  },
  {
    icon: LightBulbIcon,
    title: 'Innovation',
    description: 'Nous utilisons la technologie pour résoudre des problèmes réels et créer des solutions durables.',
  },
  {
    icon: UserGroupIcon,
    title: 'Communauté',
    description: 'Nous construisons un écosystème inclusif qui bénéficie à tous : patients, pharmaciens et livreurs.',
  },
];

const AboutPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>À Propos de PharmaFinder</title>
        <meta name="description" content="Découvrez l'histoire, la mission et l'équipe derrière PharmaFinder, la première plateforme de référencement des pharmacies en Afrique de l'Ouest" />
      </Head>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl tracking-tight font-display font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                  À Propos de{' '}
                  <span className="text-gradient">PharmaFinder</span>
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-500 sm:text-xl">
                  Nous révolutionnons l'accès aux médicaments en Afrique de l'Ouest grâce à une plateforme 
                  innovante qui connecte patients, pharmacies et professionnels de santé.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                Notre Mission
              </h2>
              <p className="mt-2 text-3xl leading-8 font-display font-bold tracking-tight text-gray-900 sm:text-4xl">
                Sauver des vies par l'innovation
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                En Afrique de l'Ouest, trouver un médicament spécifique peut prendre des heures et parfois 
                mettre des vies en danger. PharmaFinder change cela.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Le Problème que Nous Résolvons
                  </h3>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-100">
                          <span className="text-red-600">❌</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Perte de temps critique</h4>
                        <p className="text-gray-600">Parcourir de pharmacie en pharmacie peut prendre des heures</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-100">
                          <span className="text-red-600">💰</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Coûts supplémentaires</h4>
                        <p className="text-gray-600">Frais de transport et temps perdu</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-100">
                          <span className="text-red-600">🚨</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Urgences médicales</h4>
                        <p className="text-gray-600">Retards qui peuvent être fatals</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Notre Solution
                  </h3>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-100">
                          <span className="text-primary-600">✅</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Recherche instantanée</h4>
                        <p className="text-gray-600">Trouvez vos médicaments en quelques secondes</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-100">
                          <span className="text-primary-600">📍</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Géolocalisation précise</h4>
                        <p className="text-gray-600">Pharmacies les plus proches avec stocks disponibles</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-100">
                          <span className="text-primary-600">🛒</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Commande & livraison</h4>
                        <p className="text-gray-600">Click & collect ou livraison à domicile</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-primary-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="mx-auto h-8 w-8 text-primary-200 mb-2" />
                  <div className="text-3xl lg:text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm lg:text-base text-primary-100 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-16">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                Nos Valeurs
              </h2>
              <p className="mt-2 text-3xl leading-8 font-display font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ce qui nous guide
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card card-body text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <value.icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-16">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                Notre Équipe
              </h2>
              <p className="mt-2 text-3xl leading-8 font-display font-bold tracking-tight text-gray-900 sm:text-4xl">
                Des experts passionnés
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Une équipe multidisciplinaire unie par la vision d'améliorer l'accès aux soins de santé
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card card-body text-center"
                >
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 mb-4 font-medium">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="py-16 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-gray-900 sm:text-4xl mb-8">
                Notre Impact en Chiffres
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-4xl font-bold text-primary-600 mb-2">-75%</div>
                  <p className="text-gray-600">Réduction du temps de recherche</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-4xl font-bold text-success-600 mb-2">+30%</div>
                  <p className="text-gray-600">Augmentation du CA des pharmacies</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-4xl font-bold text-secondary-600 mb-2">98%</div>
                  <p className="text-gray-600">Taux de satisfaction client</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-white sm:text-4xl">
                Rejoignez-nous dans cette mission
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Ensemble, améliorons l'accès aux soins de santé en Afrique de l'Ouest
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="btn-secondary btn-lg">
                  Créer un compte
                </Link>
                <Link href="/contact" className="btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary-600">
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
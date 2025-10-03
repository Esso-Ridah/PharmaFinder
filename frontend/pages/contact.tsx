import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Head from 'next/head';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Votre message a été envoyé avec succès !');
      reset();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Contact - PharmaFinder</title>
        <meta name="description" content="Contactez l'équipe PharmaFinder pour vos questions, suggestions ou partenariats" />
      </Head>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-display font-bold text-white sm:text-5xl">
                Contactez-nous
              </h1>
              <p className="mt-4 text-xl text-primary-100">
                Nous sommes là pour vous accompagner
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info & Form */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Informations de Contact
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPinIcon className="h-6 w-6 text-primary-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                    <p className="text-gray-600">
                      Quartier Nyékonakpoé<br />
                      Lomé, Togo
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <PhoneIcon className="h-6 w-6 text-primary-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Téléphone</h3>
                    <p className="text-gray-600">+228 90 00 00 00</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-primary-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">
                      <a href="mailto:contact@pharmafinder.tg" className="text-primary-600 hover:text-primary-500">
                        contact@pharmafinder.tg
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-primary-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Horaires d'ouverture</h3>
                    <div className="text-gray-600">
                      <p>Lundi - Vendredi : 8h00 - 18h00</p>
                      <p>Samedi : 9h00 - 15h00</p>
                      <p>Dimanche : Fermé</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Suivez-nous</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Facebook
                  </a>
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Twitter
                  </a>
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    LinkedIn
                  </a>
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    {...register('name', { required: 'Le nom est requis' })}
                    type="text"
                    className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                    placeholder="Votre nom complet"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    {...register('email', {
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Email invalide',
                      },
                    })}
                    type="email"
                    className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <select
                    {...register('subject', { required: 'Veuillez sélectionner un sujet' })}
                    className={`input-field ${errors.subject ? 'border-red-300' : ''}`}
                  >
                    <option value="">Choisissez un sujet</option>
                    <option value="general">Question générale</option>
                    <option value="partnership">Partenariat pharmacie</option>
                    <option value="technical">Support technique</option>
                    <option value="billing">Facturation</option>
                    <option value="feedback">Suggestion d'amélioration</option>
                    <option value="other">Autre</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    {...register('message', { required: 'Le message est requis' })}
                    rows={6}
                    className={`input-field resize-none ${errors.message ? 'border-red-300' : ''}`}
                    placeholder="Décrivez votre demande en détail..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner mr-2"></div>
                        Envoi en cours...
                      </div>
                    ) : (
                      'Envoyer le message'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-gray-900 sm:text-4xl">
                Questions Fréquentes
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Trouvez rapidement les réponses aux questions les plus courantes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Comment devenir pharmacie partenaire ?
                </h3>
                <p className="text-gray-600">
                  Inscrivez-vous en tant que pharmacien, fournissez vos documents de certification, 
                  et notre équipe vous contactera pour valider votre partenariat.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Les prix sont-ils fixes ?
                </h3>
                <p className="text-gray-600">
                  Non, chaque pharmacie fixe ses propres prix. Notre plateforme vous permet 
                  de comparer les prix et de choisir la meilleure offre.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibent text-gray-900 mb-3">
                  Comment fonctionne la livraison ?
                </h3>
                <p className="text-gray-600">
                  Nous travaillons avec des partenaires de livraison locaux. Vous pouvez 
                  choisir entre la livraison à domicile ou le retrait en pharmacie.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  PharmaFinder est-il gratuit ?
                </h3>
                <p className="text-gray-600">
                  Oui, l'utilisation de PharmaFinder est entièrement gratuite pour les clients. 
                  Vous ne payez que le prix du médicament et les éventuels frais de livraison.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { useAuth } from '../../hooks/useAuth';
import Head from 'next/head';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'pharmacist';
  terms: boolean;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      role: 'client',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: data.role,
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Inscription - PharmaFinder</title>
        <meta name="description" content="Créez votre compte PharmaFinder" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="ml-3 text-2xl font-display font-bold text-gray-900">
                PharmaFinder
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Créer un compte
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                connectez-vous à votre compte existant
              </Link>
            </p>
          </div>

          {/* Register Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Je suis :
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    {...register('role')}
                    type="radio"
                    value="client"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">👤 Client</div>
                    <div className="text-xs text-gray-500">Je cherche des médicaments</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    {...register('role')}
                    type="radio"
                    value="pharmacist"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">💊 Pharmacien</div>
                    <div className="text-xs text-gray-500">J'ai une pharmacie</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="sr-only">
                  Prénom
                </label>
                <input
                  {...register('firstName', { required: 'Le prénom est requis' })}
                  type="text"
                  autoComplete="given-name"
                  className={`input-field ${errors.firstName ? 'border-red-300' : ''}`}
                  placeholder="Prénom"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Nom
                </label>
                <input
                  {...register('lastName', { required: 'Le nom est requis' })}
                  type="text"
                  autoComplete="family-name"
                  className={`input-field ${errors.lastName ? 'border-red-300' : ''}`}
                  placeholder="Nom"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
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
                autoComplete="email"
                className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                placeholder="Adresse email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="sr-only">
                Téléphone
              </label>
              <input
                {...register('phone')}
                type="tel"
                autoComplete="tel"
                className="input-field"
                placeholder="Téléphone (optionnel)"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-300' : ''}`}
                  placeholder="Mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Veuillez confirmer votre mot de passe',
                    validate: (value) =>
                      value === password || 'Les mots de passe ne correspondent pas',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                  placeholder="Confirmer le mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                {...register('terms', { required: 'Vous devez accepter les conditions d\'utilisation' })}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                J'accepte les{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                  politique de confidentialité
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Création du compte...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
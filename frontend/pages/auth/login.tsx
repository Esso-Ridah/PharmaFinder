import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { useAuth } from '../../hooks/useAuth';
import Head from 'next/head';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login({
        username: data.email, // FastAPI uses 'username' field
        password: data.password,
      });

      // The useAuth hook handles the redirection automatically
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Connexion - PharmaFinder</title>
        <meta name="description" content="Connectez-vous à votre compte PharmaFinder" />
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
              Connexion
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <Link
                href="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                créez un nouveau compte
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
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
                    autoComplete="current-password"
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
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('remember')}
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Mot de passe oublié ?
              </Link>
            </div>

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
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Comptes de test</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">👤 Client :</p>
                  <p className="text-gray-600">kofi.asante@gmail.com / password123</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">💊 Pharmacien :</p>
                  <p className="text-gray-600">amara.diallo@gmail.com / password123</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">🔧 Admin :</p>
                  <p className="text-gray-600">admin@pharmafinder.tg / admin123</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
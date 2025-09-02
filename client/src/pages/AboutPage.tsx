import React, { useEffect } from 'react';
import { ArrowLeft, Car, Users, Shield, Target, Award, Heart } from 'lucide-react';
import { LEGAL, BRAND } from '../config/legalConfig';

interface AboutPageProps {
  onBack: () => void;
  setCurrentView: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, setCurrentView }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">À propos de {BRAND.SITE_NAME}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-bolt-500 text-white p-4 rounded-full">
              <Car className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {BRAND.SITE_NAME}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La plateforme de référence pour acheter et vendre des véhicules automobiles, 
            motos, scooters et équipements en toute sécurité.
          </p>
        </div>

        {/* Notre Mission */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <Target className="h-8 w-8 text-primary-bolt-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Notre Mission</h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Nous nous engageons à faciliter l'achat et la vente de véhicules en France en proposant 
            une plateforme moderne, sécurisée et intuitive. Notre objectif est de connecter acheteurs 
            et vendeurs tout en garantissant transparence et confiance dans chaque transaction.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-900 font-medium">
              {BRAND.SITE_NAME} est édité par {LEGAL.COMPANY_NAME}, {LEGAL.COMPANY_LEGAL_FORM.toLowerCase()} au capital de {LEGAL.COMPANY_CAPITAL}, immatriculée au {LEGAL.COMPANY_RCS}, dont le siège social est situé au {LEGAL.COMPANY_ADDRESS}. Le représentant légal est M. {LEGAL.PUBLISHER}, {LEGAL.PUBLISHER_TITLE}.
            </p>
          </div>
        </div>

        {/* Nos Valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité</h3>
            <p className="text-gray-600">
              Système de vérification des annonces et protection des données personnelles
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Communauté</h3>
            <p className="text-gray-600">
              Une communauté active de passionnés automobile et de professionnels
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Passion</h3>
            <p className="text-gray-600">
              Créé par des passionnés pour des passionnés d'automobile
            </p>
          </div>
        </div>

        {/* Nos Services */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="h-8 w-8 text-primary-bolt-500 mr-3" />
            Nos Services
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-primary-bolt-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Annonces Véhicules</h3>
              <p className="text-gray-600">
                Voitures, motos, scooters, quads, utilitaires - tous types de véhicules
              </p>
            </div>
            <div className="border-l-4 border-primary-bolt-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pièces Détachées</h3>
              <p className="text-gray-600">
                Pièces neuves et d'occasion pour tous types de véhicules
              </p>
            </div>
            <div className="border-l-4 border-primary-bolt-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Services Professionnels</h3>
              <p className="text-gray-600">
                Réparation, entretien, remorquage - connectez-vous avec les professionnels
              </p>
            </div>
            <div className="border-l-4 border-primary-bolt-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Packs Premium</h3>
              <p className="text-gray-600">
                Boostez la visibilité de vos annonces avec nos packs premium
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-2xl shadow-lg p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">{BRAND.SITE_NAME} en Chiffres</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">10k+</div>
              <div className="text-primary-bolt-100">Annonces publiées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">5k+</div>
              <div className="text-primary-bolt-100">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">15</div>
              <div className="text-primary-bolt-100">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-primary-bolt-100">Support</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nous Contacter</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>Email :</strong> {LEGAL.CONTACT_EMAIL}
            </p>
            <p className="text-gray-700">
              <strong>Téléphone :</strong> {BRAND.PHONE_NUMBER}
            </p>
            <p className="text-gray-700">
              <strong>Adresse :</strong> {LEGAL.COMPANY_ADDRESS}, France
            </p>
            <p className="text-gray-700">
              <strong>Horaires :</strong> Lundi à Vendredi, 9h-18h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
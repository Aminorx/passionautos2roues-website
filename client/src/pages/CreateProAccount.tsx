import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
// Composants UI simples pour éviter les erreurs d'import
const Button = ({ children, onClick, type = 'button', disabled = false, variant = 'default', className = '' }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded font-medium transition-colors ${
      variant === 'outline' 
        ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </button>
);

const Input = ({ value, onChange, placeholder, required = false, type = 'text', maxLength, className = '' }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    maxLength={maxLength}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Textarea = ({ value, onChange, placeholder, required = false, rows = 4, className = '' }: any) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    rows={rows}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${className}`}
  />
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: any) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: any) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Alert = ({ children, className = '' }: any) => (
  <div className={`rounded-md bg-blue-50 border border-blue-200 p-4 ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children, className = '' }: any) => (
  <div className={`text-sm text-blue-700 ${className}`}>{children}</div>
);
import { Upload, FileText, Building2, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Simple toast replacement
const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
  alert(`${type === 'error' ? '❌' : '✅'} ${title}\n${description}`);
};

type DocumentUpload = {
  file: File | null;
  preview: string | null;
  status: 'idle' | 'uploading' | 'uploaded' | 'error';
};

export default function CreateProAccount() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    siret: '',
    companyAddress: '',
    phone: '',
    email: user?.email || '',
    website: '',
    description: ''
  });

  const [kbisDocument, setKbisDocument] = useState<DocumentUpload>({
    file: null,
    preview: null,
    status: 'idle'
  });

  const kbisInputRef = useRef<HTMLInputElement>(null);

  const createProAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const formDataToSend = new FormData();
      
      // Ajouter les données du compte
      Object.keys(data.accountData).forEach(key => {
        formDataToSend.append(key, data.accountData[key]);
      });
      
      // Ajouter le fichier
      if (data.kbisFile) {
        formDataToSend.append('kbisDocument', data.kbisFile);
      }

      return apiRequest('/api/professional-accounts', {
        method: 'POST',
        body: formDataToSend,
      });
    },
    onSuccess: () => {
      showToast(
        'Compte professionnel créé !',
        'Votre demande est en cours de vérification. Vous recevrez une notification par email.',
        'success'
      );
      setStep(3); // Étape de confirmation
    },
    onError: (error: any) => {
      showToast(
        'Erreur',
        'Impossible de créer le compte professionnel. Veuillez réessayer.',
        'error'
      );
    },
  });

  const handleKbisUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast(
        'Format non autorisé',
        'Veuillez télécharger un fichier PDF, JPEG ou PNG.',
        'error'
      );
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(
        'Fichier trop volumineux',
        'La taille maximale autorisée est de 5MB.',
        'error'
      );
      return;
    }

    setKbisDocument({
      file,
      preview: file.type.includes('image') ? URL.createObjectURL(file) : null,
      status: 'uploaded'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kbisDocument.file) {
      showToast(
        'Document manquant',
        'Veuillez télécharger votre extrait Kbis.',
        'error'
      );
      return;
    }

    if (!formData.siret || formData.siret.length !== 14) {
      showToast(
        'SIRET invalide',
        'Le numéro SIRET doit contenir exactement 14 chiffres.',
        'error'
      );
      return;
    }

    setLoading(true);
    createProAccountMutation.mutate({
      accountData: formData,
      kbisFile: kbisDocument.file
    });
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Étape 3 : Confirmation
  if (step === 3) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Demande envoyée avec succès !</CardTitle>
            <CardDescription>
              Votre compte professionnel est en cours de vérification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Prochaines étapes :</strong><br />
                • Notre équipe va vérifier vos documents (24-48h)<br />
                • Vous recevrez un email de confirmation<br />
                • Vous pourrez ensuite choisir votre abonnement
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              className="w-full"
            >
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Créer un compte professionnel</h1>
        <p className="text-gray-600">
          Obtenez un badge "✔ Pro vérifié" et accédez aux fonctionnalités premium
        </p>
      </div>

      {/* Étapes */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className="w-16 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className="w-16 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            ✓
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape 1 : Informations entreprise */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
              <CardDescription>
                Renseignez les informations officielles de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Raison sociale *
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('companyName', e.target.value)}
                    placeholder="Garage Dupont SARL"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Numéro SIRET *
                  </label>
                  <Input
                    value={formData.siret}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('siret', e.target.value.replace(/\D/g, '').slice(0, 14))}
                    placeholder="12345678901234"
                    required
                    maxLength={14}
                  />
                  <p className="text-xs text-gray-500 mt-1">14 chiffres uniquement</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Adresse de l'entreprise *
                </label>
                <Textarea
                  value={formData.companyAddress}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="123 Avenue des Garages, 75001 Paris"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Téléphone *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                    placeholder="01 23 45 67 89"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                    type="email"
                    placeholder="contact@garage-dupont.fr"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Site web (optionnel)
                </label>
                <Input
                  value={formData.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.garage-dupont.fr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description de l'activité (optionnel)
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Spécialisé dans la vente et réparation de véhicules d'occasion..."
                  rows={3}
                />
              </div>

              <Button 
                type="button" 
                onClick={() => setStep(2)}
                className="w-full"
                disabled={!formData.companyName || !formData.siret || !formData.companyAddress || !formData.phone || !formData.email}
              >
                Suivant : Documents de vérification
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Étape 2 : Upload documents */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Documents de vérification
              </CardTitle>
              <CardDescription>
                Téléchargez votre extrait Kbis récent (moins de 3 mois)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Documents acceptés :</strong> PDF, JPEG, PNG (max 5MB)<br />
                  L'extrait Kbis doit être récent (moins de 3 mois) et lisible.
                </AlertDescription>
              </Alert>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  {kbisDocument.status === 'uploaded' ? (
                    <div className="space-y-4">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                      <div>
                        <h3 className="font-medium">Extrait Kbis téléchargé</h3>
                        <p className="text-sm text-gray-500">{kbisDocument.file?.name}</p>
                        <p className="text-xs text-gray-400">
                          {kbisDocument.file && `${(kbisDocument.file.size / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>
                      {kbisDocument.preview && (
                        <img 
                          src={kbisDocument.preview} 
                          alt="Aperçu"
                          className="max-w-xs mx-auto rounded border"
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => kbisInputRef.current?.click()}
                      >
                        Changer le fichier
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="font-medium">Extrait Kbis *</h3>
                        <p className="text-sm text-gray-500">
                          Cliquez pour télécharger ou faites glisser votre fichier
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => kbisInputRef.current?.click()}
                      >
                        Sélectionner un fichier
                      </Button>
                    </div>
                  )}
                </div>
                
                <input
                  ref={kbisInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleKbisUpload}
                  className="hidden"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button 
                  type="submit"
                  disabled={!kbisDocument.file || loading}
                  className="flex-1"
                >
                  {loading ? 'Création en cours...' : 'Créer le compte professionnel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
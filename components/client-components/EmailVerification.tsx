import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onBack,
  onVerified
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsResending(false);
    setResendCooldown(60);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }

      // Auto-verify when all fields are filled
      if (newCode.every(digit => digit !== '') && newCode.join('') === '123456') {
        setTimeout(() => onVerified(), 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vérifiez votre email
        </h2>
        <p className="text-gray-600">
          Nous avons envoyé un code de vérification à
        </p>
        <p className="font-semibold text-primary-bolt-500">{email}</p>
      </div>

      {/* Verification Code Input */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
          Entrez le code de vérification
        </label>
        <div className="flex justify-center space-x-3">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary-bolt-500 focus:ring-2 focus:ring-primary-bolt-500 focus:ring-opacity-20 transition-all"
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Le code expire dans 10 minutes
        </p>
      </div>

      {/* Resend Email */}
      <div className="text-center mb-6">
        <p className="text-gray-600 mb-3">Vous n'avez pas reçu le code ?</p>
        <button
          onClick={handleResendEmail}
          disabled={isResending || resendCooldown > 0}
          className="inline-flex items-center space-x-2 text-primary-bolt-500 hover:text-primary-bolt-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
          <span>
            {resendCooldown > 0 
              ? `Renvoyer dans ${resendCooldown}s`
              : isResending 
                ? 'Envoi en cours...'
                : 'Renvoyer le code'
            }
          </span>
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Retour</span>
      </button>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Astuce :</strong> Vérifiez votre dossier spam si vous ne trouvez pas l'email.
          Pour tester, utilisez le code : <strong>123456</strong>
        </p>
      </div>
    </div>
  );
};
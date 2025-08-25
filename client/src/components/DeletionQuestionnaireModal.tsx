import { useState } from 'react';
import { DraggableModal } from './DraggableModal';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DeletionQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleTitle: string;
  vehicleId: string;
  onDeleteConfirmed: () => void;
}

type DeletionReason = 'sold_on_site' | 'sold_elsewhere' | 'no_longer_selling' | 'other';

const DELETION_REASONS = [
  { value: 'sold_on_site', label: 'Vendue via PassionAutos2Roues' },
  { value: 'sold_elsewhere', label: 'Vendue ailleurs' },
  { value: 'no_longer_selling', label: 'Je ne souhaite plus vendre' },
  { value: 'other', label: 'Autre' }
] as const;

export function DeletionQuestionnaireModal({ 
  isOpen, 
  onClose, 
  vehicleTitle, 
  vehicleId, 
  onDeleteConfirmed 
}: DeletionQuestionnaireModalProps) {
  const [selectedReason, setSelectedReason] = useState<DeletionReason | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    console.log(`${variant === 'destructive' ? '❌' : '✅'} ${title}: ${description}`);
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      showToast("Veuillez sélectionner une raison", "Une raison est requise pour continuer", "destructive");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/delete-with-reason`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: selectedReason,
          comment: selectedReason === 'other' ? comment : null
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setShowConfirmation(true);
      
      // Attendre 2 secondes puis fermer et notifier
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
        onDeleteConfirmed();
        
        // Reset form
        setSelectedReason('');
        setComment('');
      }, 2000);

    } catch (error) {
      showToast("Erreur", "Une erreur est survenue lors de la suppression de l'annonce", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !showConfirmation) {
      setSelectedReason('');
      setComment('');
      onClose();
    }
  };

  if (showConfirmation) {
    return (
      <DraggableModal
        isOpen={isOpen}
        onClose={() => {}}
        title="Confirmation"
        className="max-w-md"
      >
        <div className="flex flex-col items-center text-center py-6">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Annonce supprimée avec succès</h3>
          <p className="text-gray-600">
            Merci pour votre retour. L'annonce "{vehicleTitle}" a été retirée de la plateforme.
          </p>
        </div>
      </DraggableModal>
    );
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pourquoi supprimez-vous cette annonce ?"
      className="max-w-lg"
    >
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <span>Annonce concernée : </span>
            <span className="font-medium text-gray-900">{vehicleTitle}</span>
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            {DELETION_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="deletionReason"
                  id={reason.value}
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedReason(e.target.value as DeletionReason)}
                  className="w-4 h-4 text-primary-bolt-600 focus:ring-primary-bolt-500 focus:ring-2"
                />
                <label htmlFor={reason.value} className="font-medium cursor-pointer text-gray-700 flex-1">
                  {reason.label}
                </label>
              </div>
            ))}
          </div>

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <label htmlFor="comment" className="block text-sm font-medium">
                Précisez la raison (facultatif)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="Décrivez brièvement la raison..."
                maxLength={50}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">
                {comment.length}/50 caractères
              </p>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Important :</strong> Cette action supprimera définitivement votre annonce.
          </p>
        </div>

        <div className="flex gap-4 pt-6 px-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}
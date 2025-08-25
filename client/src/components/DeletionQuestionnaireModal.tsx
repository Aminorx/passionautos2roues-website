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
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Annonce concernée :</p>
          <p className="font-medium">{vehicleTitle}</p>
        </div>

        <div className="space-y-4">
          <label className="text-base font-medium block">
            Sélectionnez la raison de suppression *
          </label>
          
          <div className="space-y-3">
            {DELETION_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deletionReason"
                  id={reason.value}
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedReason(e.target.value as DeletionReason)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor={reason.value} className="font-normal cursor-pointer">
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
                maxLength={500}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">
                {comment.length}/500 caractères
              </p>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Important :</strong> Cette action supprimera définitivement votre annonce de la plateforme. 
            Elle ne pourra pas être réactivée.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}
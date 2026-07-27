import React, { useState } from 'react';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '@/services/api';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onInviteSent: () => void;
  currentMemberCount: number;
  maxTeamSize: number;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  onInviteSent,
  currentMemberCount,
  maxTeamSize,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (currentMemberCount >= maxTeamSize) {
      setError(`Team has reached the maximum capacity of ${maxTeamSize} members.`);
      return;
    }

    setIsLoading(true);
    try {
      await apiService.sendInvitation(teamId, email.trim());
      setSuccessMessage(`Invitation sent to ${email.trim()}`);
      setEmail('');
      onInviteSent();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Teammate" size="md">
      <div className="flex flex-col gap-5 py-2 font-manrope">
        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-[rgba(0,243,255,0.04)] border border-[rgba(0,243,255,0.15)] flex items-start gap-3">
          <UserPlus size={20} className="text-accent-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-white">Invite via College Email</p>
            <p className="text-[rgba(255,255,255,0.6)] mt-0.5 leading-relaxed">
              Enter your peer student's registered college email. They will receive an invitation on their Team Dashboard.
            </p>
            <p className="text-[10px] text-accent-primary font-mono mt-1">
              Current Members: {currentMemberCount} / {maxTeamSize} max
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <Input
            label="Student Email Address"
            placeholder="e.g. classmate@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(255,255,255,0.08)]">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="h-10 text-xs px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="h-10 text-xs px-6"
            >
              Dispatch Invitation
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

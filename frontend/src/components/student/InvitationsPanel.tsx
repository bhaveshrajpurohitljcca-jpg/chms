import React, { useState } from 'react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Mail, UserPlus, CheckCircle2, X, Clock } from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendInvitation } from '@/services/api';

interface InvitationsPanelProps {
  invitations: BackendInvitation[];
  onInvitationActioned: () => void; // Callback to refresh team state after accept/reject
}

export const InvitationsPanel: React.FC<InvitationsPanelProps> = ({
  invitations,
  onInvitationActioned,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const handleAccept = async (invitationId: string) => {
    setActionLoading(invitationId);
    setActionErrors(prev => ({ ...prev, [invitationId]: '' }));
    try {
      await apiService.acceptInvitation(invitationId);
      onInvitationActioned();
    } catch (err: any) {
      setActionErrors(prev => ({
        ...prev,
        [invitationId]: err.message || 'Failed to accept invitation.',
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setActionLoading(invitationId);
    setActionErrors(prev => ({ ...prev, [invitationId]: '' }));
    try {
      await apiService.rejectInvitation(invitationId);
      onInvitationActioned();
    } catch (err: any) {
      setActionErrors(prev => ({
        ...prev,
        [invitationId]: err.message || 'Failed to reject invitation.',
      }));
    } finally {
      setActionLoading(null);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Mail size={18} className="text-accent-primary" />
        <h4 className="font-archivo text-lg uppercase font-bold text-white">
          Team Invitations
        </h4>
        {pendingInvitations.length > 0 && (
          <span className="ml-auto text-[10px] font-mono font-bold text-accent-primary bg-accent-primary/10 border border-accent-primary/30 px-2 py-0.5 rounded-full">
            {pendingInvitations.length} pending
          </span>
        )}
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="flex flex-col gap-3">
          {pendingInvitations.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-accent-primary/[0.03] border border-accent-primary/20 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary flex-shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {inv.invited_by?.full_name || 'Team Leader'}
                    </p>
                    <p className="text-[11px] text-white/50 truncate">
                      has invited you to join a team
                    </p>
                  </div>
                </div>
                <Badge variant="warning" className="flex-shrink-0 text-[10px]">
                  <Clock size={10} className="inline mr-1" />
                  Pending
                </Badge>
              </div>

              {/* Error for this invitation */}
              {actionErrors[inv.id] && (
                <p className="text-xs text-danger">{actionErrors[inv.id]}</p>
              )}

              {/* Accept / Reject buttons */}
              <div className="flex gap-2">
                <Button
                  variant="success"
                  onClick={() => handleAccept(inv.id)}
                  isLoading={actionLoading === inv.id}
                  disabled={actionLoading !== null}
                  className="flex-1 h-9 text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Accept</span>
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleReject(inv.id)}
                  isLoading={actionLoading === inv.id}
                  disabled={actionLoading !== null}
                  className="flex-1 h-9 text-xs flex items-center justify-center gap-1.5"
                >
                  <X size={14} />
                  <span>Decline</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

    </Card>
  );
};

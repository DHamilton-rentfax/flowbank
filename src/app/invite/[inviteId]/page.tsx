'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // Assuming this hook exists

type InviteData = {
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy?: string; // UID of inviter
};

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const inviteId = params.inviteId as string;
  const { user, loading } = useAuth(); // Assuming useAuth provides user and loading state

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) {
      setError('Invalid invite link.');
      setIsLoading(false);
      return;
    }

    // If user is loading, wait
    if (loading) return;

    const fetchInvite = async () => {
      try {
        // Fetch invite data from an API route or server action
        // You'll need to create a server action or API route to safely read invite data
        const response = await fetch(`/api/team/invite/${inviteId}`); // Example API route
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch invite data.');
        }

        if (data.status !== 'pending') {
           setMessage(`This invite has already been ${data.status}.`);
           setIsLoading(false);
           return;
        }

        setInvite(data);

      } catch (err: any) {
        console.error('Fetch invite error:', err);
        setError(err.message || 'Failed to load invite details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvite();

  }, [inviteId, user, loading]); // Depend on user and loading to handle auth state changes


  const handleAccept = async () => {
    if (!user) {
      setMessage('Please sign in to accept the invite.');
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    if (user.email !== invite?.email) {
         setError('You must be logged in with the invited email address to accept.');
         return;
    }


    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Call the API route to accept the invite
      const response = await fetch('/api/team/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invite.');
      }

      setMessage('Invite accepted! Redirecting to dashboard...');
      // Optionally update user's state or redirect
      router.push('/dashboard'); // Redirect to dashboard after acceptance

    } catch (err: any) {
      console.error('Accept invite error:', err);
      setError(err.message || 'Failed to accept invitation.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading invite...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

   if (message) {
    return <div className="p-6 text-center text-green-600">{message}</div>;
  }


  if (!invite) {
       return <div className="p-6 text-center text-gray-500">Invite not found or expired.</div>;
  }


  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4 text-center">You've Been Invited!</h1>

      <div className="mb-4">
        <p className="text-gray-700">You have been invited to join a team.</p>
        <p className="mt-2 text-sm text-gray-600">Invited Email: <span className="font-medium">{invite.email}</span></p>
        <p className="text-sm text-gray-600">Role: <span className="font-medium capitalize">{invite.role}</span></p>
      </div>

      {!user && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <p>Please sign in with the invited email address ({invite.email}) to accept this invitation.</p>
          </div>
      )}

      {user && user.email !== invite.email && (
           <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p>You are signed in as {user.email}. Please sign out and sign in with the invited email address ({invite.email}) to accept.</p>
           </div>
      )}


      <button
        onClick={handleAccept}
        disabled={isLoading || !user || user.email !== invite.email}
        className={`w-full px-4 py-2 rounded transition ${
          isLoading || !user || user.email !== invite.email
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Accepting...' : 'Accept Invitation'}
      </button>
    </div>
  );
}
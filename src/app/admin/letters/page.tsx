
"use client";

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LettersAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/letters/latest');
        const json = await res.json();
        if (json?.letter) {
            setLetter(json.letter);
        }
      } catch (error) {
        toast({ title: "Error", description: "Could not fetch latest letter.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  async function save() {
    if (!title || !body) {
        toast({ title: "Missing Fields", description: "Please provide a title and body.", variant: "destructive"});
        return;
    }
    setSaving(true);
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
        toast({ title: "Not Authenticated", variant: "destructive" });
        setSaving(false);
        return;
    }
    try {
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/letters/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title, body }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to save letter');
        toast({ title: 'Letter Saved!', description: 'Reload the page to see the latest version.' });
        setTitle('');
        setBody('');
    } catch (e) {
        const err = e as Error;
        toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
        setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-secondary py-8">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <h1 className="text-2xl font-bold">Letters (Admin)</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Latest Letter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-40 w-full" />
                        ) : !letter ? (
                            <p className="text-sm text-gray-600">No letters yet.</p>
                        ) : (
                            <div className="bg-white p-4 border rounded-lg">
                                <h3 className="text-xl font-semibold mb-2">{letter.title}</h3>
                                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: letter.body }} />
                                <div className="mt-4">
                                    <Button onClick={()=>window.print()} variant="outline">Print / Save as PDF</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Letter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm mb-2 font-medium">Title</label>
                            <Input value={title} onChange={(e)=>setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm mt-4 mb-2 font-medium">Body (HTML)</label>
                            <Textarea value={body} onChange={(e)=>setBody(e.target.value)} rows={10} className="font-mono" placeholder="<p>Dear ...</p>" />
                        </div>
                        <Button onClick={save} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Letter'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}

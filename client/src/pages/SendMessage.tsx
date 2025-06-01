import { useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Helmet } from 'react-helmet-async';

export default function SendMessage() {
  const { id } = useParams(); // farm space ID
  const [, navigate] = useLocation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: farmSpace, isLoading } = useQuery({
    queryKey: ['/api/farm-spaces', id],
    queryFn: async () => {
      const response = await fetch(`/api/farm-spaces/${id}`);
      if (!response.ok) throw new Error('Failed to fetch farm space');
      return response.json();
    }
  });

  const { data: ownerData } = useQuery({
    queryKey: ['/api/users', farmSpace?.sellerProfileId],
    queryFn: async () => {
      if (!farmSpace?.sellerProfileId) return null;
      const response = await fetch(`/api/users/${farmSpace.sellerProfileId}`);
      if (!response.ok) throw new Error('Failed to fetch owner');
      return response.json();
    },
    enabled: !!farmSpace?.sellerProfileId
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { recipientId: number; subject: string; message: string; farmSpaceId: number }) => {
      return apiRequest('POST', '/api/messages', messageData);
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Your message has been sent to the farm space owner.",
      });
      navigate(`/farm-spaces/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to send messages.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both subject and message are required.",
        variant: "destructive",
      });
      return;
    }

    if (farmSpace && ownerData?.user) {
      sendMessageMutation.mutate({
        recipientId: farmSpace.sellerProfileId,
        subject: subject.trim(),
        message: message.trim(),
        farmSpaceId: farmSpace.id
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!farmSpace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Farm Space Not Found</h1>
          <Link href="/farm-spaces">
            <Button>Back to Farm Spaces</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Send Message - {farmSpace.title} | FarmDirect</title>
        <meta name="description" content={`Send a message about ${farmSpace.title}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Navigation */}
        <Link href={`/farm-spaces/${id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farm Space
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
              Send Message
            </h1>
            <p className="text-slate-600">
              Contact the owner about "{farmSpace.title}"
            </p>
          </div>

          {/* Owner Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Message Recipient</CardTitle>
            </CardHeader>
            <CardContent>
              {ownerData?.user && (
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={ownerData.user.image} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{ownerData.user.name}</div>
                    <div className="text-sm text-slate-600">Property Owner</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Subject
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={`Inquiry about ${farmSpace.title}`}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Message
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi! I'm interested in renting your farm space. Could you tell me more about..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                  <Link href={`/farm-spaces/${id}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
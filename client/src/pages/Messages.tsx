import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/simpleAuth";

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  farmSpaceId?: number;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  userId: number;
  userName: string;
  userImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  farmSpaceId?: number;
}

export default function Messages() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Connect to WebSocket for real-time messaging
  useEffect(() => {
    if (currentUser) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'join', userId: currentUser.id }));
        setWs(socket);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          // Refresh messages when new message arrives
          queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
          queryClient.invalidateQueries({ queryKey: ['/api/messages/conversation'] });
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [currentUser, queryClient]);

  // Fetch all messages for conversation list
  const { data: messagesData } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!currentUser
  });

  // Fetch conversation with selected user
  const { data: conversationData } = useQuery({
    queryKey: ['/api/messages/conversation', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return null;
      const response = await fetch(`/api/messages/conversation/${selectedConversation}`);
      return response.json();
    },
    enabled: !!selectedConversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { recipientId: number; subject: string; message: string; farmSpaceId?: number }) => {
      return apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversation', selectedConversation] });
    }
  });

  // Group messages into conversations
  const conversations: Conversation[] = [];
  if (messagesData?.messages) {
    const messageMap = new Map<number, Message[]>();
    
    messagesData.messages.forEach((message: Message) => {
      const otherUserId = message.senderId === currentUser?.id ? message.recipientId : message.senderId;
      if (!messageMap.has(otherUserId)) {
        messageMap.set(otherUserId, []);
      }
      messageMap.get(otherUserId)!.push(message);
    });

    messageMap.forEach((messages, userId) => {
      const latestMessage = messages[0];
      const unreadCount = messages.filter(m => !m.isRead && m.recipientId === currentUser?.id).length;
      
      conversations.push({
        userId,
        userName: `User ${userId}`, // This would be fetched from user data
        lastMessage: latestMessage.message,
        lastMessageTime: new Date(latestMessage.createdAt).toLocaleDateString(),
        unreadCount,
        farmSpaceId: latestMessage.farmSpaceId
      });
    });
  }

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;

    sendMessageMutation.mutate({
      recipientId: selectedConversation,
      subject: "Property Inquiry",
      message: newMessage
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Sign in to view messages
            </h3>
            <p className="text-gray-500 mb-4">
              Connect with property owners and buyers through secure messaging
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Messages - FarmDirect</title>
        <meta name="description" content="Secure messaging with property owners and buyers on FarmDirect marketplace." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">Connect with property owners and buyers</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Start a conversation by contacting a property owner
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.userId}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conversation.userId
                            ? 'bg-blue-50 border-blue-200 border'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedConversation(conversation.userId)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={conversation.userImage} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">
                                {conversation.userName}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {conversation.lastMessageTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Thread */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedConversation ? `Conversation with User ${selectedConversation}` : 'Select a conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
                      {conversationData?.conversation?.map((message: Message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === currentUser.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Send Message */}
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a conversation to start messaging</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
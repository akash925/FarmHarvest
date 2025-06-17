import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | FarmDirect</title>
        <meta name="description" content="Get in touch with the FarmDirect team. We're here to help!" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                      First Name
                    </label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                      Last Name
                    </label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Email
                  </label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Subject
                  </label>
                  <Input placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Tell us more about your question or feedback..."
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Get in touch</CardTitle>
                <CardDescription>
                  We're here to help with any questions about FarmDirect.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span className="text-slate-600">support@farmdirect.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary-500" />
                  <span className="text-slate-600">1-800-FARM-DIRECT</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <span className="text-slate-600">San Francisco, CA</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">How do I start selling on FarmDirect?</h4>
                    <p className="text-sm text-slate-600">Create an account, set up your farm profile, and start listing your produce!</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Are there any fees?</h4>
                    <p className="text-sm text-slate-600">We take a small commission on sales to maintain the platform and provide support.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">How does farm space rental work?</h4>
                    <p className="text-sm text-slate-600">Browse available spaces, contact the owner, and arrange your rental terms directly.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | FarmDirect</title>
        <meta name="description" content="Terms of Service for using FarmDirect." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Please read these terms carefully before using FarmDirect.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using FarmDirect, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3>2. Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of FarmDirect per device for personal, non-commercial transitory viewing only.
            </p>

            <h3>3. User Accounts</h3>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times.
            </p>

            <h3>4. Prohibited Uses</h3>
            <p>
              You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.
            </p>

            <h3>5. Content</h3>
            <p>
              Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.
            </p>

            <h3>6. Privacy Policy</h3>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
            </p>

            <h3>7. Limitation of Liability</h3>
            <p>
              In no event shall FarmDirect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any damages.
            </p>

            <h3>8. Contact Information</h3>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@farmdirect.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 
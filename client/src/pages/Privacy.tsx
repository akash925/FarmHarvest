import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | FarmDirect</title>
        <meta name="description" content="Privacy Policy for FarmDirect." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            
            <h3>1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            </p>

            <h3>3. Information Sharing</h3>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>

            <h3>4. Data Security</h3>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h3>5. Cookies</h3>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.
            </p>

            <h3>6. Your Rights</h3>
            <p>
              You have the right to access, update, or delete your personal information. You can also opt out of certain communications.
            </p>

            <h3>7. Children's Privacy</h3>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h3>8. Changes to This Policy</h3>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h3>9. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@farmdirect.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default function Safety() {
  return (
    <>
      <Helmet>
        <title>Safety | FarmDirect</title>
        <meta name="description" content="Learn about safety measures and best practices on FarmDirect." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
            Safety First
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your safety and security are our top priorities. Learn about our safety measures and best practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary-500" />
                <div>
                  <CardTitle>Platform Security</CardTitle>
                  <CardDescription>How we protect your data and transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Encrypted data transmission</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>User verification processes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Regular security audits</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-primary-500" />
                <div>
                  <CardTitle>Community Guidelines</CardTitle>
                  <CardDescription>Creating a safe environment for everyone</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Respectful communication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Honest product descriptions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Timely delivery commitments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Quality assurance standards</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <CardTitle>Safety Tips</CardTitle>
                <CardDescription>Best practices for buyers and sellers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">For Buyers</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Meet sellers in public places when possible</li>
                  <li>• Verify product quality before payment</li>
                  <li>• Use the platform's messaging system</li>
                  <li>• Report suspicious activity immediately</li>
                  <li>• Keep transaction records</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">For Sellers</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Provide accurate product descriptions</li>
                  <li>• Use clear, recent photos</li>
                  <li>• Communicate delivery expectations</li>
                  <li>• Follow food safety guidelines</li>
                  <li>• Maintain proper storage conditions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Report Issues</CardTitle>
            <CardDescription>
              If you encounter any safety concerns or violations, please contact us immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Emergency</h4>
                <p className="text-slate-600 text-sm">Call local emergency services</p>
                <p className="font-bold">911</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Safety Issues</h4>
                <p className="text-slate-600 text-sm">Report platform violations</p>
                <p className="font-bold">safety@farmdirect.com</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">General Support</h4>
                <p className="text-slate-600 text-sm">For other concerns</p>
                <p className="font-bold">support@farmdirect.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 
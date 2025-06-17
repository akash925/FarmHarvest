import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Help() {
  return (
    <>
      <Helmet>
        <title>Help Center | FarmDirect</title>
        <meta name="description" content="Find answers to common questions about using FarmDirect." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Find answers to frequently asked questions about using FarmDirect.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>New to FarmDirect? Start here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I create an account?</AccordionTrigger>
                  <AccordionContent>
                    Click "Get Started" in the top navigation, fill out the signup form with your details, and verify your email address.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I set up my farm profile?</AccordionTrigger>
                  <AccordionContent>
                    After logging in, go to your profile dropdown and select "Setup Farm Profile". Fill out your farm information, location, and products you grow.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is FarmDirect free to use?</AccordionTrigger>
                  <AccordionContent>
                    Creating an account and browsing listings is free. We charge a small commission on completed sales to maintain the platform.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selling</CardTitle>
              <CardDescription>For farmers and growers</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="sell-1">
                  <AccordionTrigger>How do I list my produce for sale?</AccordionTrigger>
                  <AccordionContent>
                    Go to the "Sell" page, click "Create New Listing", and fill out the details about your produce including title, description, price, and photos.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sell-2">
                  <AccordionTrigger>How do I manage my listings?</AccordionTrigger>
                  <AccordionContent>
                    Visit your profile page to see all your active listings. You can edit, pause, or delete listings as needed.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sell-3">
                  <AccordionTrigger>When do I get paid?</AccordionTrigger>
                  <AccordionContent>
                    Payments are processed after successful delivery confirmation. Funds are typically available within 2-3 business days.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buying</CardTitle>
              <CardDescription>For customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="buy-1">
                  <AccordionTrigger>How do I find local produce?</AccordionTrigger>
                  <AccordionContent>
                    Use the "Buy" section to browse listings, filter by location, and use our map view to find producers near you.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="buy-2">
                  <AccordionTrigger>How do I purchase items?</AccordionTrigger>
                  <AccordionContent>
                    Click on any listing to view details, select your quantity, and click "Buy Now" to proceed to checkout.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="buy-3">
                  <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                  <AccordionContent>
                    We accept all major credit cards through our secure payment processor.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Farm Spaces</CardTitle>
              <CardDescription>Renting growing space</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="space-1">
                  <AccordionTrigger>How do farm space rentals work?</AccordionTrigger>
                  <AccordionContent>
                    Browse available farm spaces in the "Lease" section, contact the owner directly to discuss terms, and arrange your rental agreement.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="space-2">
                  <AccordionTrigger>How do I list my farm space for rent?</AccordionTrigger>
                  <AccordionContent>
                    From your profile, navigate to the farm spaces section and click "Add Farm Space" to create a listing with details about your available land.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="space-3">
                  <AccordionTrigger>What should I consider when renting space?</AccordionTrigger>
                  <AccordionContent>
                    Consider soil quality, water access, sunlight exposure, proximity to your location, and the farm owner's policies and support level.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 
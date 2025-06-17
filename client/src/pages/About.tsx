import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | FarmDirect</title>
        <meta name="description" content="Learn about FarmDirect's mission to connect local growers with food lovers." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
            About FarmDirect
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Connecting local growers with food lovers for fresher, healthier communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We believe in strengthening local food systems by making it easier for farmers and 
                gardeners to sell their produce directly to consumers, while providing access to 
                fresh, locally-grown food.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Farm Spaces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Beyond produce sales, we facilitate farm space rentals, helping urban dwellers 
                find growing space and enabling farm owners to maximize their land utilization.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Why Choose FarmDirect?</CardTitle>
            <CardDescription>Building stronger communities through local food</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🌱</div>
              <h3 className="font-semibold mb-2">Fresh & Local</h3>
              <p className="text-sm text-slate-600">Direct from farm to table, reducing food miles and maximizing freshness.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold mb-2">Community Focused</h3>
              <p className="text-sm text-slate-600">Building relationships between growers and consumers in local communities.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Easy to Use</h3>
              <p className="text-sm text-slate-600">Simple platform for buying, selling, and renting farm spaces.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 
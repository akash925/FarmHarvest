import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Blog() {
  return (
    <>
      <Helmet>
        <title>Blog | FarmDirect</title>
        <meta name="description" content="Stay updated with the latest news and insights from FarmDirect." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
            FarmDirect Blog
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Stay updated with the latest news, tips, and insights from the world of local farming.
          </p>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Coming Soon</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            We're working on bringing you valuable content about local farming, growing tips, and community stories. 
            Check back soon for our latest posts!
          </p>
        </div>
      </div>
    </>
  );
} 
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AllListings from "@/pages/AllListings";
import ListingDetail from "@/pages/ListingDetail";
import CreateListing from "@/pages/CreateListing";
import UserProfile from "@/pages/UserProfile";
import EditProfile from "@/pages/EditProfile";
import Checkout from "@/pages/Checkout";
import MyOrders from "@/pages/MyOrders";
import Auth from "@/pages/FixedAuth";
import EnhancedSellerProfile from "@/pages/EnhancedSellerProfile";
import SellerProfileSetup from "@/pages/SellerProfileSetup";
import FarmSpaces from "@/pages/FarmSpaces";
import FarmSpaceDetail from "@/pages/FarmSpaceDetail";
import SendMessage from "@/pages/SendMessage";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";

function App() {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/listings" component={AllListings} />
            <Route path="/listings/new" component={CreateListing} />
            <Route path="/listings/:id" component={ListingDetail} />
            <Route path="/users/:id" component={UserProfile} />
            <Route path="/profile/edit" component={EditProfile} />
            <Route path="/checkout/:listingId" component={Checkout} />
            <Route path="/orders" component={MyOrders} />
            <Route path="/auth" component={Auth} />
            <Route path="/seller-profile/:id" component={EnhancedSellerProfile} />
            <Route path="/seller-profile-setup" component={SellerProfileSetup} />
            <Route path="/farm-spaces" component={FarmSpaces} />
            <Route path="/farm-spaces/:id" component={FarmSpaceDetail} />
            <Route path="/farm-spaces/:id/message" component={SendMessage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;

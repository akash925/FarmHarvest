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
import Sell from "@/pages/Sell";
import Listings from "@/pages/Listings";
import Messages from "@/pages/Messages";
import MarketplaceMap from "@/pages/MarketplaceMap";
import FarmSpaces from "@/pages/FarmSpaces";
import FarmSpaceDetail from "@/pages/FarmSpaceDetail";
import SendMessage from "@/pages/SendMessage";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";

function App() {
  // Temporarily disable auth loading to get app working
  // const { isInitializing } = useAuth();
  const isInitializing = false;

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
            <Route path="/sell" component={Sell} />
            <Route path="/listings" component={Listings} />
            <Route path="/marketplace-map" component={MarketplaceMap} />
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

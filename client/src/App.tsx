import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Main pages
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

// Product/Listing pages
import AllListings from "@/pages/AllListings";
import ListingDetail from "@/pages/ListingDetail";
import CreateListing from "@/pages/CreateListing";
import EditListing from "@/pages/EditListing";
import Listings from "@/pages/Listings";

// User pages
import UserProfile from "@/pages/UserProfile";
import EditProfile from "@/pages/EditProfile";
import MyOrders from "@/pages/MyOrders";
import FarmProfileEdit from "@/pages/FarmProfileEdit";

// Authentication pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

// Seller pages
import Sell from "@/pages/Sell";
import EnhancedSellerProfile from "@/pages/EnhancedSellerProfile";
import SellerProfileSetup from "@/pages/SellerProfileSetup";

// Farm space pages
import FarmSpaces from "@/pages/FarmSpaces";
import FarmSpaceDetail from "@/pages/FarmSpaceDetail";
import CreateFarmSpace from "@/pages/CreateFarmSpace";

// Communication pages
import Messages from "@/pages/Messages";
import SendMessage from "@/pages/SendMessage";

// Commerce pages
import Checkout from "@/pages/Checkout";

// Map page
import MarketplaceMap from "@/pages/MarketplaceMap";

// Static pages
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import Help from "@/pages/Help";
import Safety from "@/pages/Safety";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

// Layout components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Switch>
              {/* Home */}
              <Route path="/" component={Home} />
              
              {/* Authentication */}
              <Route path="/auth" component={Login} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              
              {/* Listings/Products */}
              <Route path="/listings" component={AllListings} />
              <Route path="/listings/new" component={CreateListing} />
              <Route path="/listings/edit/:id" component={EditListing} />
              <Route path="/listings/:id" component={ListingDetail} />
              
              {/* User Profile */}
              <Route path="/users/:id" component={UserProfile} />
              <Route path="/profile/edit" component={EditProfile} />
              <Route path="/farm-profile-edit" component={FarmProfileEdit} />
              <Route path="/orders" component={MyOrders} />
              
              {/* Selling */}
              <Route path="/sell" component={Sell} />
              <Route path="/seller-profile/:id" component={EnhancedSellerProfile} />
              <Route path="/seller-profile-setup" component={SellerProfileSetup} />
              
              {/* Farm Spaces */}
              <Route path="/farm-spaces" component={FarmSpaces} />
              <Route path="/farm-spaces/new" component={CreateFarmSpace} />
              <Route path="/farm-spaces/:id" component={FarmSpaceDetail} />
              <Route path="/farm-spaces/:id/message" component={SendMessage} />
              
              {/* Communication */}
              <Route path="/messages" component={Messages} />
              
              {/* Commerce */}
              <Route path="/checkout/:listingId" component={Checkout} />
              
              {/* Map */}
              <Route path="/map" component={MarketplaceMap} />
              
              {/* Static Pages */}
              <Route path="/about" component={About} />
              <Route path="/blog" component={Blog} />
              <Route path="/contact" component={Contact} />
              <Route path="/help" component={Help} />
              <Route path="/safety" component={Safety} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy" component={Privacy} />
              
              {/* 404 */}
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
          <Toaster />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;

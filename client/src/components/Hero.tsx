import { useState } from 'react';
import { useLocation } from 'wouter';
import SearchForm from './SearchForm';

export default function Hero() {
  const [, navigate] = useLocation();
  
  const handleSearch = (location: string, category: string) => {
    const params = new URLSearchParams();
    
    if (location) {
      params.append('zip', location);
    }
    
    if (category && category !== 'All Categories') {
      params.append('category', category);
    }
    
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-90"></div>
        <img 
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&h=700" 
          alt="Farmers market with fresh produce" 
          className="w-full h-full object-cover" 
          loading="lazy" 
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="md:w-2/3 lg:w-1/2">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight mb-4">
            Fresh from Local Farms <br/>Direct to Your Table
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-8">
            Discover and purchase homegrown produce from local farmers and gardeners near you. Picked fresh, delivered with care.
          </p>
          
          {/* Search component for homepage */}
          <div className="bg-white p-4 rounded-xl shadow-lg max-w-md">
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </div>
    </section>
  );
}

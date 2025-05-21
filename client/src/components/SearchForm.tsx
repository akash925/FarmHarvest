import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFormProps {
  onSearch: (location: string, category: string) => void;
  className?: string;
}

export default function SearchForm({ onSearch, className = '' }: SearchFormProps) {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All Categories');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(location, category);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="mb-3">
        <Label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Your Location</Label>
        <Input
          id="location"
          placeholder="Enter ZIP code"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-400 focus:border-primary-400"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Looking for</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value)}
        >
          <SelectTrigger id="category" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-400 focus:border-primary-400">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Categories">All Categories</SelectItem>
            <SelectItem value="Fruits">Fruits</SelectItem>
            <SelectItem value="Vegetables">Vegetables</SelectItem>
            <SelectItem value="Eggs">Eggs</SelectItem>
            <SelectItem value="Herbs">Herbs</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-primary-400 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out"
      >
        Search Nearby
      </Button>
    </form>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

interface FarmSpaceFormData {
  title: string;
  description: string;
  sizeSqft: number;
  soilType: string;
  lightConditions: string;
  waterAccess: boolean;
  greenhouseAccess: boolean;
  toolStorage: boolean;
  pricePerMonth: number;
  location: string;
  availableFrom: string;
  availableUntil?: string;
}

export default function CreateFarmSpace() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FarmSpaceFormData>({
    title: '',
    description: '',
    sizeSqft: 0,
    soilType: '',
    lightConditions: '',
    waterAccess: false,
    greenhouseAccess: false,
    toolStorage: false,
    pricePerMonth: 0,
    location: '',
    availableFrom: ''
  });

  const createFarmSpaceMutation = useMutation({
    mutationFn: async (farmSpace: FarmSpaceFormData) => {
      const response = await fetch('/api/farm-spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ farmSpace }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create farm space');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Farm space created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/farm-spaces'] });
      navigate('/farm-spaces');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert price to cents
    const farmSpaceData = {
      ...formData,
      price: Math.round(formData.price * 100), // Convert to cents
    };
    
    createFarmSpaceMutation.mutate(farmSpaceData);
  };

  const handleInputChange = (field: keyof FarmSpaceFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <Helmet>
        <title>Add Farm Space | FarmDirect</title>
        <meta name="description" content="List your farm space for rent on FarmDirect" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Add Farm Space
          </h1>
          <p className="text-slate-600">
            List your farm space for rent and connect with aspiring gardeners.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Farm Space Details</CardTitle>
            <CardDescription>
              Provide information about the space you're offering for rent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Title *
                </label>
                <Input
                  placeholder="e.g., Sunny 200 sq ft Garden Plot"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Description *
                </label>
                <Textarea
                  placeholder="Describe your farm space, location, and any special features..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Square Footage *
                  </label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.squareFootage || ''}
                    onChange={(e) => handleInputChange('squareFootage', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Price per Month ($) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Soil Type *
                  </label>
                  <Select value={formData.soilType} onValueChange={(value) => handleInputChange('soilType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loam">Loam</SelectItem>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="sandy">Sandy</SelectItem>
                      <SelectItem value="silt">Silt</SelectItem>
                      <SelectItem value="organic">Organic Mix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Light Conditions *
                  </label>
                  <Select value={formData.lightConditions} onValueChange={(value) => handleInputChange('lightConditions', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select light conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_sun">Full Sun</SelectItem>
                      <SelectItem value="partial_sun">Partial Sun</SelectItem>
                      <SelectItem value="partial_shade">Partial Shade</SelectItem>
                      <SelectItem value="full_shade">Full Shade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Irrigation Options *
                  </label>
                  <Select value={formData.irrigationOptions} onValueChange={(value) => handleInputChange('irrigationOptions', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select irrigation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hose_access">Hose Access</SelectItem>
                      <SelectItem value="drip_irrigation">Drip Irrigation</SelectItem>
                      <SelectItem value="sprinkler">Sprinkler System</SelectItem>
                      <SelectItem value="manual_watering">Manual Watering</SelectItem>
                      <SelectItem value="none">None Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Management Level *
                  </label>
                  <Select value={formData.managementLevel} onValueChange={(value) => handleInputChange('managementLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select management level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hands_off">Hands Off</SelectItem>
                      <SelectItem value="minimal_guidance">Minimal Guidance</SelectItem>
                      <SelectItem value="active_support">Active Support</SelectItem>
                      <SelectItem value="full_management">Full Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Available From *
                </label>
                <Input
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Available Until (optional)
                </label>
                <Input
                  type="date"
                  value={formData.availableUntil}
                  onChange={(e) => handleInputChange('availableUntil', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Any additional information about rules, access, amenities, etc."
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/farm-spaces')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createFarmSpaceMutation.isPending}
                  className="flex-1"
                >
                  {createFarmSpaceMutation.isPending ? 'Creating...' : 'Create Farm Space'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 
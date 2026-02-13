import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCollege } from '@/contexts/CollegeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, GraduationCap } from 'lucide-react';
import type { College } from '@/types';

const CollegeSelection = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { setCollege } = useCollege();

  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => api.getColleges(),
    retry: false,
  });

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (college: College) => {
    setCollege(college);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-sidebar py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(234_85%_55%/0.15),transparent_70%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <GraduationCap className="h-4 w-4" />
              Enterprise Campus Operations
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-sidebar-primary-foreground tracking-tight">
              CampusOps
            </h1>
            <p className="text-lg text-sidebar-foreground/70">
              Multi-college workforce, event & operations management platform
            </p>
            <div className="relative max-w-md mx-auto mt-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-sidebar-border"
              />
            </div>
          </div>
        </div>
      </div>

      {/* College Grid */}
      <div className="container py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((college) => (
            <Card key={college._id} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {college.logo ? (
                      <img src={college.logo} alt={college.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <GraduationCap className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-lg truncate">{college.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-sm truncate">{college.location}</span>
                    </div>
                    {college.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{college.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full mt-5"
                  onClick={() => handleSelect(college)}
                >
                  Access Portal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No colleges found matching "{search}"</p>
        )}
      </div>
    </div>
  );
};

export default CollegeSelection;

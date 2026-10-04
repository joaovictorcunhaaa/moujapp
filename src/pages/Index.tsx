import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';

const Index = () => {
  const navigate = useNavigate();
  const { data } = useOnboarding();

  useEffect(() => {
    if (data.completedOnboarding) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  }, [data.completedOnboarding, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
};

export default Index;

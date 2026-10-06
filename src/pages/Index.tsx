import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { DisclaimerBanner, useDisclaimerAccepted } from '@/components/DisclaimerBanner';

const Index = () => {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const { accepted, accept } = useDisclaimerAccepted();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Se disclaimer não foi aceito, mostrar antes de continuar
    if (!accepted) {
      setIsLoading(false);
      return;
    }

    // Disclaimer aceito, redirecionar para o fluxo correto
    if (data.completedOnboarding) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  }, [data.completedOnboarding, navigate, accepted]);

  // Se disclaimer não foi aceito, mostrar
  if (!accepted) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <DisclaimerBanner
          onAccept={() => {
            accept();
            // Após aceitar, redirecionar
            setTimeout(() => {
              if (data.completedOnboarding) {
                navigate('/dashboard');
              } else {
                navigate('/onboarding');
              }
            }, 500);
          }}
          onReject={() => {
            // Se rejeitar, fechar ou mostrar mensagem
            alert('Você precisa aceitar os termos para usar MoujApp.');
            window.location.href = 'https://moujapp.com'; // Redirecionar para site
          }}
        />
      </div>
    );
  }

  // Loading enquanto redireciona
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
};

export default Index;

/**
 * Banner de disclaimer que aparece na homepage
 * ⚠️ IMPORTANTE: Deve ser obrigatório aceitar antes de usar o app
 */

import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DisclaimerBannerProps {
  onAccept?: () => void;
  onReject?: () => void;
  compact?: boolean; // Versão compacta para dentro do app
}

export const DisclaimerBanner = ({ onAccept, onReject, compact = false }: DisclaimerBannerProps) => {
  const [accepted, setAccepted] = useState(false);
  const [showFull, setShowFull] = useState(false);

  if (compact) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-800">
          <strong>⚠️ Aviso importante:</strong> MoujApp é uma ferramenta de rastreamento, não um app médico.
          Sempre consulte seu médico. Leia nossos{' '}
          <button
            onClick={() => setShowFull(true)}
            className="underline hover:text-amber-900"
          >
            termos completos
          </button>
          .
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <CardTitle className="text-red-900">⚠️ Aviso Legal e Disclaimer Médico</CardTitle>
              <CardDescription className="text-red-700 mt-2">
                Por favor, leia e aceite antes de usar o MoujApp
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Seção 1: Não é app médico */}
          <div className="bg-white p-4 rounded-lg border border-red-100">
            <h3 className="font-semibold text-red-900 mb-2">1. MoujApp NÃO é um aplicativo médico</h3>
            <p className="text-sm text-gray-700 mb-2">
              Este aplicativo é uma <strong>ferramenta de rastreamento e acompanhamento pessoal</strong>. Não fornece:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>❌ Diagnósticos médicos</li>
              <li>❌ Prescrições de medicamentos</li>
              <li>❌ Orientações de médico ou nutricionista</li>
              <li>❌ Tratamento de condições de saúde</li>
            </ul>
          </div>

          {/* Seção 2: Consulte seu médico */}
          <div className="bg-white p-4 rounded-lg border border-red-100">
            <h3 className="font-semibold text-red-900 mb-2">2. Você DEVE consultar seu médico</h3>
            <p className="text-sm text-gray-700">
              Antes de qualquer decisão sobre sua saúde, medicamentos ou tratamento, <strong>sempre consulte seu médico</strong>.
              Este app é um auxílio pessoal, não um substituto para orientação profissional.
            </p>
          </div>

          {/* Seção 3: Emergências */}
          <div className="bg-white p-4 rounded-lg border border-red-100">
            <h3 className="font-semibold text-red-900 mb-2">3. Emergências médicas</h3>
            <p className="text-sm text-gray-700 mb-2">
              Se você está enfrentando uma emergência médica (dor intensa, dificuldade respirar, reações alérgicas):
            </p>
            <p className="text-sm font-bold text-red-700">
              🚨 <strong>LIGUE PARA EMERGÊNCIA AGORA</strong><br />
              🇧🇷 Brasil: 192 (SAMU) ou 911<br />
              🇪🇸 Espanha: 112<br />
              🇵🇹 Portugal: 112
            </p>
          </div>

          {/* Seção 4: IA e privacidade */}
          <div className="bg-white p-4 rounded-lg border border-orange-100">
            <h3 className="font-semibold text-orange-900 mb-2">4. Análise de IA e análise de fotos</h3>
            <p className="text-sm text-gray-700 mb-2">
              Quando você usa análise de fotos ou chat com IA:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>📸 Sua imagem é enviada à OpenAI para análise</li>
              <li>💬 Suas mensagens são enviadas à OpenAI para processamento</li>
              <li>✅ Seus dados não são permanentemente armazenados</li>
              <li>⚠️ Análise de IA pode não ser 100% precisa</li>
            </ul>
          </div>

          {/* Checkbox de aceite */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="disclaimer-accept"
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                  className="mt-1"
                />
                <Label
                  htmlFor="disclaimer-accept"
                  className="text-sm cursor-pointer text-gray-700 font-medium"
                >
                  ✅ Eu entendo que MoujApp é uma ferramenta de rastreamento, não um app médico, e sempre consultarei meu médico para decisões de saúde.
                </Label>
              </div>
            </div>

            <p className="text-xs text-gray-500 ml-6">
              Leia os <button
                onClick={() => setShowFull(true)}
                className="underline hover:text-gray-700"
              >
                termos legais completos
              </button> para mais informações.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onReject?.()}
              variant="outline"
              className="flex-1"
            >
              Recusar
            </Button>
            <Button
              onClick={() => onAccept?.()}
              disabled={!accepted}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceitar e Continuar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal com termos completos */}
      {showFull && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Termos Legais Completos - MoujApp</CardTitle>
              <button
                onClick={() => setShowFull(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h3>1. Aviso de Não-Responsabilidade Médica</h3>
              <p>
                MoujApp é uma ferramenta de rastreamento pessoal. NÃO fornece orientações médicas, diagnósticos ou prescrições.
                Sempre consulte seu médico antes de tomar decisões sobre sua saúde.
              </p>

              <h3>2. Emergências Médicas</h3>
              <p>
                Para emergências, ligue imediatamente para o número de emergência local. Este app não substitui atendimento urgente.
              </p>

              <h3>3. Privacidade dos Dados</h3>
              <p>
                Seus dados são armazenados localmente no seu dispositivo. Análises de IA (fotos, chat) são enviadas à OpenAI
                para processamento, mas não são armazenadas permanentemente.
              </p>

              <h3>4. Limitações de Responsabilidade</h3>
              <p>
                MoujApp é fornecido "como está". Não garantimos precisão dos dados, funcionamento contínuo ou que funcionará
                para qualquer propósito específico. Não somos responsáveis por perdas ou danos resultantes do uso.
              </p>

              <p className="text-sm text-gray-600 mt-6">
                Para termos legais completos, veja LEGAL_DISCLAIMERS.md no repositório.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Hook para verificar se usuário aceitou disclaimer
export const useDisclaimerAccepted = () => {
  const [accepted, setAccepted] = useState(() => {
    try {
      const stored = localStorage.getItem('moujapp-disclaimer-accepted');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const accept = () => {
    localStorage.setItem('moujapp-disclaimer-accepted', JSON.stringify(true));
    setAccepted(true);
  };

  return { accepted, accept };
};

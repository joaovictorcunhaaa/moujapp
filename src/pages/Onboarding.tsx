import { useOnboarding } from '@/hooks/useOnboarding';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { Welcome } from '@/components/onboarding/steps/Welcome';
import { TreatmentStatus } from '@/components/onboarding/steps/TreatmentStatus';
import { MedicationSelection } from '@/components/onboarding/steps/MedicationSelection';
import { DoseSelection } from '@/components/onboarding/steps/DoseSelection';
import { FrequencySelection } from '@/components/onboarding/steps/FrequencySelection';
import { GenderSelection } from '@/components/onboarding/steps/GenderSelection';
import { BirthDate } from '@/components/onboarding/steps/BirthDate';
import { Measurements } from '@/components/onboarding/steps/Measurements';
import { StartWeight } from '@/components/onboarding/steps/StartWeight';
import { TargetWeight } from '@/components/onboarding/steps/TargetWeight';
import { PlateauMotivation } from '@/components/onboarding/steps/PlateauMotivation';
import { WeightLossSpeed } from '@/components/onboarding/steps/WeightLossSpeed';
import { ActivityLevel } from '@/components/onboarding/steps/ActivityLevel';
import { ProgressChart } from '@/components/onboarding/steps/ProgressChart';
import { SideEffects } from '@/components/onboarding/steps/SideEffects';
import { SuccessStories } from '@/components/onboarding/steps/SuccessStories';
import { Motivations } from '@/components/onboarding/steps/Motivations';
import { NameInput } from '@/components/onboarding/steps/NameInput';
import { EmailInput } from '@/components/onboarding/steps/EmailInput';
import { LoadingAnalysis } from '@/components/onboarding/steps/LoadingAnalysis';
import { PersonalizedPlan } from '@/components/onboarding/steps/PersonalizedPlan';
import { calculateNutritionalGoals, calculateNutritionalGoalsFromTDEE, calculateAge, getSuggestedHealthyWeight } from '@/utils/calculations';
import { useNavigate } from 'react-router-dom';

const TOTAL_STEPS = 20;

const Onboarding = () => {
  const { data, updateData, nextStep, previousStep } = useOnboarding();
  const navigate = useNavigate();

  const handleComplete = () => {
    updateData({ completedOnboarding: true });
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (data.currentStep) {
      case 0:
        return (
          <StepContainer
            currentStep={0}
            totalSteps={TOTAL_STEPS}
            onBack={() => navigate('/')}
            showBack={false}
          >
            <Welcome onContinue={nextStep} />
          </StepContainer>
        );

      case 1:
        return (
          <StepContainer
            currentStep={1}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <TreatmentStatus
              selected={data.treatmentStatus}
              onSelect={(status) => updateData({ treatmentStatus: status })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 2:
        return (
          <StepContainer
            currentStep={2}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <MedicationSelection
              selected={data.medication}
              onSelect={(medication) => updateData({ medication })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 3:
        return (
          <StepContainer
            currentStep={3}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <DoseSelection
              selected={data.currentDose}
              onSelect={(currentDose) => updateData({ currentDose })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 4:
        return (
          <StepContainer
            currentStep={4}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <FrequencySelection
              selected={data.frequency}
              onSelect={(frequency) => updateData({ frequency })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 5:
        return (
          <StepContainer
            currentStep={5}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <GenderSelection
              selected={data.gender}
              onSelect={(gender) => updateData({ gender: gender as any })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 6:
        return (
          <StepContainer
            currentStep={6}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <BirthDate
              value={data.birthDate}
              onSelect={(birthDate) => updateData({ birthDate })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 7:
        return (
          <StepContainer
            currentStep={7}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <Measurements
              value={{ height: data.height || 169, weight: data.weight || 70 }}
              onSelect={({ height, weight }) => updateData({ height, weight })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 8:
        return (
          <StepContainer
            currentStep={8}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <StartWeight
              value={data.startWeight}
              onSelect={(startWeight) => updateData({ startWeight })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 9:
        return (
          <StepContainer
            currentStep={9}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            {(() => {
              const current = typeof data.weight === 'number'
                ? data.weight
                : (typeof data.startWeight === 'number' ? data.startWeight : 70);
              const suggested = data.height ? getSuggestedHealthyWeight(data.height, 'max') : undefined;
              // Prioriza sempre mostrar a sugestão como valor inicial visível
              const initialTarget = suggested ?? (typeof data.targetWeight === 'number' ? data.targetWeight : current);
              return (
                <TargetWeight
                  value={initialTarget}
                  currentWeight={current}
                  suggestedWeight={suggested}
                  onSelect={(targetWeight) => {
                    const weightToLose = current - targetWeight;
                    updateData({ targetWeight, weightToLose });
                  }}
                  onContinue={nextStep}
                />
              );
            })()}
          </StepContainer>
        );

      case 10:
        return (
          <StepContainer
            currentStep={10}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <PlateauMotivation
              weightToLose={data.weightToLose || 5}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 11:
        return (
          <StepContainer
            currentStep={11}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <WeightLossSpeed
              value={data.weightLossSpeed}
              onSelect={(weightLossSpeed) => updateData({ weightLossSpeed })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 12:
        return (
          <StepContainer
            currentStep={12}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <ActivityLevel
              selected={data.activityLevel}
              onSelect={(activityLevel) => updateData({ activityLevel: activityLevel as any })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 13:
        return (
          <StepContainer
            currentStep={13}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <ProgressChart onContinue={nextStep} />
          </StepContainer>
        );

      case 14:
        return (
          <StepContainer
            currentStep={14}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <SideEffects
              selected={data.sideEffects}
              onSelect={(sideEffects) => updateData({ sideEffects })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 15:
        return (
          <StepContainer
            currentStep={15}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <Motivations
              selected={data.motivations}
              onSelect={(motivations) => updateData({ motivations })}
              onContinue={nextStep}
            />
          </StepContainer>
        );

      case 16:
        return (
          <StepContainer
            currentStep={16}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <SuccessStories onContinue={nextStep} />
          </StepContainer>
        );

      case 17:
        return (
          <StepContainer
            currentStep={17}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <NameInput
              value={data.name}
              onSelect={(name) => updateData({ name })}
              onContinue={nextStep}
              onSkip={nextStep}
            />
          </StepContainer>
        );

      case 18:
        return (
          <StepContainer
            currentStep={18}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <EmailInput
              value={data.email}
              onSelect={(email) => updateData({ email })}
              onContinue={nextStep}
              onSkip={nextStep}
            />
          </StepContainer>
        );

      case 19:
        return <LoadingAnalysis onComplete={nextStep} />;

      case 20: {
        const age = data.birthDate ? calculateAge(data.birthDate) : 25;
        
        // Usar a mesma lógica do Lifestyle para consistência
        const mapSpeedToDeficitPercent = (speed?: number): number => {
          if (!speed || speed <= 0) return 0.15; // padrão: 15%
          if (speed < 0.6) return 0.10;
          if (speed < 1.0) return 0.15;
          return 0.20;
        };
        const deficitPercent = mapSpeedToDeficitPercent(data.weightLossSpeed);
        
        const goals = calculateNutritionalGoalsFromTDEE(
          data.weight || 70,
          data.height || 170,
          age,
          data.gender || 'female',
          data.activityLevel || 'sedentary',
          deficitPercent
        );

        return (
          <StepContainer
            currentStep={20}
            totalSteps={TOTAL_STEPS}
            onBack={previousStep}
          >
            <PersonalizedPlan
              startWeight={data.startWeight || 71}
              currentWeight={data.weight || 69}
              targetWeight={data.targetWeight || 64}
              nextDoseDay="Quinta-feira"
              frequency={data.frequency || 'Semanalmente'}
              waterGoal={goals.water}
              caloriesGoal={goals.calories}
              proteinGoal={goals.protein}
              fiberGoal={goals.fiber}
              onContinue={handleComplete}
            />
          </StepContainer>
        );
      }

      default:
        return <Welcome onContinue={nextStep} />;
    }
  };

  return <>{renderStep()}</>;
};

export default Onboarding;

import { useEffect, useState } from "react";
import { TourTooltip } from "@/components/ui/tour-tooltip";
import { Button } from "@/components/ui/button";
import { useTour, type TourStep } from "@/hooks/use-tour";

interface TourProviderProps {
  tourId: string;
  steps: TourStep[];
  children: React.ReactNode;
}

export function TourProvider({ tourId, steps, children }: TourProviderProps) {
  const { currentTour, currentStep, nextStep, previousStep, markTourComplete, startTour } = useTour();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !currentTour) {
      startTour(tourId);
    }
  }, [mounted, tourId, currentTour, startTour]);

  if (!mounted) return <>{children}</>;

  const isActive = currentTour === tourId;
  const currentStepData = isActive ? steps[currentStep] : null;

  if (!isActive || !currentStepData) return <>{children}</>;

  const targetElement = document.getElementById(currentStepData.targetId);
  if (!targetElement) return <>{children}</>;

  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {children}
      <TourTooltip
        open={true}
        content={
          <div className="space-y-2">
            <h3 className="font-semibold">{currentStepData.title}</h3>
            <p className="text-sm">{currentStepData.content}</p>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => previousStep()}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (isLastStep) {
                    markTourComplete(tourId);
                  } else {
                    nextStep();
                  }
                }}
              >
                {isLastStep ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        }
        side={currentStepData.placement}
      >
        <div id={currentStepData.targetId} className="contents" />
      </TourTooltip>
    </>
  );
}
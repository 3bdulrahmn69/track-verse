'use client';

import { MdCheckCircle } from 'react-icons/md';

interface RegistrationProgressProps {
  currentStep: number;
}

export function RegistrationProgress({
  currentStep,
}: RegistrationProgressProps) {
  return (
    <div
      className="flex items-center justify-center mb-6"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={3}
      aria-label={`Registration progress: Step ${currentStep} of 3`}
    >
      <div className="flex items-center space-x-2">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            currentStep >= 1
              ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {currentStep > 1 ? <MdCheckCircle className="w-6 h-6" /> : '1'}
        </div>
        <div
          className={`w-12 h-1 transition-all duration-300 ${
            currentStep >= 2 ? 'bg-primary' : 'bg-muted'
          }`}
        />
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            currentStep >= 2
              ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {currentStep > 2 ? <MdCheckCircle className="w-6 h-6" /> : '2'}
        </div>
        <div
          className={`w-12 h-1 transition-all duration-300 ${
            currentStep >= 3 ? 'bg-primary' : 'bg-muted'
          }`}
        />
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            currentStep >= 3
              ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          3
        </div>
      </div>
    </div>
  );
}

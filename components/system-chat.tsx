'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { SparklesIcon } from '@/components/icons';

type SystemMessage = {
  id: string;
  text: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
  }>;
};

export function InteractiveSystemChat({
  initialMessage,
  onComplete,
}: {
  initialMessage?: string;
  onComplete?: (result: Record<string, string>) => void;
}) {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchNextStep = useCallback(async (previousStepId?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system-chat/respond', {
        method: 'POST',
        body: JSON.stringify({
          previousStepId,
          selectedOption: previousStepId ? selectedOptions[previousStepId] : null,
          initialMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch next step');
      }

      const nextStep: SystemMessage = await response.json();

      if (nextStep) {
        setMessages((prev) => [...prev, nextStep]);
        setCurrentStep((prev) => prev + 1);
      } else if (onComplete) {
        onComplete(selectedOptions);
      }
    } catch (error) {
      toast.error('Error in workflow', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [initialMessage, onComplete, selectedOptions]);

  const handleOptionSelect = useCallback((stepId: string, optionValue: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [stepId]: optionValue,
    }));
    fetchNextStep(stepId);
  }, [fetchNextStep]);

  useEffect(() => {
    if (!messages.length) {
      fetchNextStep();
    }
  }, [fetchNextStep, messages.length]);

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {messages.map((message, index) => (
        <div 
          key={message.id} 
          className="flex flex-col gap-2 bg-muted p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <SparklesIcon size={16} />
            <span className="font-medium">Assistant</span>
          </div>
          <p>{message.text}</p>
          
          {message.options && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {message.options.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  onClick={() => handleOptionSelect(message.id, option.value)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

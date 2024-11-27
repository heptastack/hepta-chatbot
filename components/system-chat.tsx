'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

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

const fetcher = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch next step');
  }

  return response.json();
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

  const { data, error, mutate } = useSWR(
    '/api/system-chat/respond',
    (url) => fetcher(url, { initialMessage, selectedOptions: null })
  );

  const fetchNextStep = useCallback(
    async (previousStepId?: string) => {
      setIsLoading(true);
      try {
        const body = {
          previousStepId,
          selectedOptions: previousStepId ? selectedOptions[previousStepId] : null,
          initialMessage,
        };

        const nextStep = await mutate(body, { revalidate: false });
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
    },
    [initialMessage, onComplete, selectedOptions, mutate]
  );

  const handleOptionSelect = useCallback(
    (stepId: string, optionValue: string) => {
      setSelectedOptions((prev) => ({
        ...prev,
        [stepId]: optionValue,
      }));
      fetchNextStep(stepId);
    },
    [fetchNextStep]
  );

  useEffect(() => {
    if (!messages.length) {
      fetchNextStep();
    }
  }, [fetchNextStep, messages.length]);

  if (error) {
    toast.error('Error in workflow', {
      description: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {messages.map((message, index) => (
        <div key={message.id} className="flex flex-col gap-2 bg-muted p-4 rounded-xl">
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

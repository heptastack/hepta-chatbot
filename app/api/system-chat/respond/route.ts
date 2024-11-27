import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { previousStepId, selectedOption, initialMessage } = await request.json();

  // This is a mock implementation. In a real-world scenario, 
  // you would replace this with actual workflow logic
  const workflows: Record<string, (selectedOption?: string) => SystemMessage | null> = {
    initial: () => ({
      id: 'initial',
      text: 'What type of document would you like to create?',
      options: [
        { id: 'doc-type-1', label: 'Essay', value: 'essay' },
        { id: 'doc-type-2', label: 'Report', value: 'report' },
        { id: 'doc-type-3', label: 'Blog Post', value: 'blog' },
      ],
    }),
    'doc-type-1': (selectedOption) => {
      if (selectedOption === 'essay') {
        return {
          id: 'essay-topic',
          text: 'What topic would you like to write about?',
          options: [
            { id: 'topic-1', label: 'Technology', value: 'technology' },
            { id: 'topic-2', label: 'Environment', value: 'environment' },
            { id: 'topic-3', label: 'Social Issues', value: 'social' },
          ],
        };
      }
      return null;
    },
    'essay-topic': (selectedOption) => {
      if (selectedOption) {
        return {
          id: 'essay-length',
          text: 'How long should the essay be?',
          options: [
            { id: 'length-1', label: 'Short (500 words)', value: 'short' },
            { id: 'length-2', label: 'Medium (1000 words)', value: 'medium' },
            { id: 'length-3', label: 'Long (1500 words)', value: 'long' },
          ],
        };
      }
      return null;
    },
  };

  const nextStep = previousStepId 
    ? workflows[previousStepId]?.(selectedOption) 
    : workflows['initial']();

  if (nextStep) {
    return NextResponse.json(nextStep);
  }

  return NextResponse.json(null);
}

type SystemMessage = {
  id: string;
  text: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
  }>;
};

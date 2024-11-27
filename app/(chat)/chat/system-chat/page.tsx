import { InteractiveSystemChat } from '@/components/system-chat';

export default async function SystemChatPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <InteractiveSystemChat />
    </div>
  );
}

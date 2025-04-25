import { useStore } from '@nanostores/react';
import { Dialog, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { promptLibraryStore } from '~/lib/stores/promptLibrary';
import { PromptList } from './PromptList.client';

interface PromptLibraryProps {
  onSelect: (content: string) => void;
}

export function PromptLibrary({ onSelect }: PromptLibraryProps) {
  const { showDialog } = useStore(promptLibraryStore);

  const handleOpenChange = (open: boolean) => {
    promptLibraryStore.set({
      ...promptLibraryStore.get(),
      showDialog: open
    });
  };

  return (
    <DialogRoot open={showDialog} onOpenChange={handleOpenChange}>
      <Dialog className="w-[800px] max-w-[800px]">
        <DialogTitle>
          <div className="flex items-center gap-2">
            <div className="i-ph:book-bookmark text-xl" />
            Prompt Library
          </div>
        </DialogTitle>
        <div className="max-h-[80vh] overflow-y-auto p-5">
          <PromptList onSelect={(content) => {
            onSelect(content);
            handleOpenChange(false);
          }} />
        </div>
      </Dialog>
    </DialogRoot>
  );
}

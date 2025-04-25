import { DialogRoot, Dialog, DialogTitle } from '~/components/ui/Dialog';
import { useState } from 'react';
import { promptLibraryActions } from '~/lib/stores/promptLibrary';

interface SavePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  source: 'input' | 'chat';
}

export function SavePromptDialog({ open, onOpenChange, content, source }: SavePromptDialogProps) {
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    await promptLibraryActions.savePrompt(content, description, source);
    setDescription('');
    onOpenChange(false);
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog className="w-[500px]">
        <DialogTitle>Save to Prompt Library</DialogTitle>
        <div className="flex flex-col gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">
              Prompt Content
            </label>
            <div className="p-3 bg-bolt-elements-background-depth-2 rounded-lg text-bolt-elements-textPrimary">
              {content}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg text-bolt-elements-textPrimary focus:outline-none focus:border-bolt-elements-borderColorFocus"
              placeholder="Add a description for this prompt..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-4 py-2 rounded-lg bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </Dialog>
    </DialogRoot>
  );
}

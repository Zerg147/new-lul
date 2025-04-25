import { Dialog } from '~/components/ui/Dialog';
import { useState } from 'react';
import { promptLibraryActions } from '~/lib/stores/promptLibrary';

interface SavePromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  source: 'input' | 'chat';
}

export function SavePromptDialog({ isOpen, onClose, content, source }: SavePromptDialogProps) {
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    await promptLibraryActions.savePrompt(content, description, source);
    setDescription('');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Save to Prompt Library"
      className="w-[500px]"
      actions={[
        {
          label: 'Cancel',
          onClick: onClose,
        },
        {
          label: 'Save',
          onClick: handleSave,
          primary: true,
          disabled: !content.trim(),
        },
      ]}
    >
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
      </div>
    </Dialog>
  );
}

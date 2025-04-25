import type { Message } from 'ai';
import React, { useState } from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { IconButton } from '~/components/ui/IconButton';
import { SavePromptDialog } from '~/components/promptLibrary/SavePromptDialog.client';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

interface MessageContainerProps {
  message: Message;
  isFirst: boolean;
  isLast: boolean;
  isStreaming: boolean;
}

export const MessageContainer = ({ message, isFirst, isLast, isStreaming }: MessageContainerProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const isUserMessage = message.role === 'user';

  return (
    <div
      className={classNames('flex gap-4 p-6 w-full rounded-[calc(0.75rem-1px)] group', {
        'bg-bolt-elements-messages-background': isUserMessage || !isStreaming || (isStreaming && !isLast),
        'bg-gradient-to-b from-bolt-elements-messages-background from-30% to-transparent':
          isStreaming && isLast,
        'mt-4': !isFirst,
      })}
    >
      {isUserMessage && (
        <div className="flex items-center justify-center w-[34px] h-[34px] overflow-hidden bg-white text-gray-600 rounded-full shrink-0 self-start">
          <div className="i-ph:user-fill text-xl"></div>
        </div>
      )}
      <div className="grid grid-col-1 w-full">
        {isUserMessage ? <UserMessage content={message.content} /> : <AssistantMessage content={message.content} />}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton
          title="Save to Prompt Library"
          onClick={() => setShowSaveDialog(true)}
          className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
        >
          <div className="i-ph:bookmark-simple text-xl" />
        </IconButton>
      </div>
      <SavePromptDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        content={message.content}
        source="chat"
      />
    </div>
  );
};

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [] } = props;

  return (
    <div id={id} ref={ref} className={props.className}>
      {messages.length > 0
        ? messages.map((message, index) => (
            <MessageContainer
              key={index}
              message={message}
              isFirst={index === 0}
              isLast={index === messages.length - 1}
              isStreaming={isStreaming}
            />
          ))
        : null}
      {isStreaming && (
        <div className="text-center w-full text-bolt-elements-textSecondary i-svg-spinners:3-dots-fade text-4xl mt-4"></div>
      )}
    </div>
  );
});

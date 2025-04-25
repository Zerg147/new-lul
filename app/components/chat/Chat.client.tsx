import { useStore } from '@nanostores/react';
import type { Message } from 'ai';
import { useChat } from 'ai/react';
import { useAnimate } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import { useMessageParser, usePromptEnhancer, useShortcuts } from '~/lib/hooks';
import { useChatHistory } from '~/lib/persistence';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { DEFAULT_MODEL } from '~/utils/constants';
import { cubicEasingFn } from '~/utils/easings';
import { createScopedLogger, renderLogger } from '~/utils/logger';
import { BaseChat } from './BaseChat';

const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
});

const logger = createScopedLogger('Chat');

interface ChatProps {
  initialMessages?: Message[];
  storeMessageHistory?: (messages: Message[]) => Promise<void>;
  model: string;
  setModel: (model: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  agent: string;
  setAgent: (agent: string) => void;
  modelList: typeof import('~/utils/constants').MODEL_LIST;
  onChatStart: () => void;
}

export function Chat({ model, setModel, provider, setProvider, agent, setAgent, modelList, onChatStart }: ChatProps) {
  renderLogger.trace('Chat');

  const { ready, initialMessages, storeMessageHistory } = useChatHistory();

  return (
    <>
      {ready && (
        <ChatImpl
          agent={agent}
          setAgent={setAgent}
          initialMessages={initialMessages}
          storeMessageHistory={storeMessageHistory}
          model={model}
          setModel={setModel}
          provider={provider}
          setProvider={setProvider}
          modelList={modelList}
          onChatStart={onChatStart}
        />
      )}
      <ToastContainer
        closeButton={({ closeToast }) => {
          return (
            <button className="Toastify__close-button" onClick={closeToast}>
              <div className="i-ph:x text-lg" />
            </button>
          );
        }}
        icon={({ type }) => {
          switch (type) {
            case 'success':
              return <div className="i-ph:check-bold text-bolt-elements-icon-success text-2xl" />;
            case 'error':
              return <div className="i-ph:warning-circle-bold text-bolt-elements-icon-error text-2xl" />;
          }
          return undefined;
        }}
        position="bottom-right"
        pauseOnFocusLoss
        transition={toastAnimation}
      />
    </>
  );
}

interface ChatImplProps extends ChatProps {
  initialMessages?: Message[];
  storeMessageHistory?: (messages: Message[]) => Promise<void>;
}

const ChatImpl = memo(
  ({ initialMessages, storeMessageHistory, model, setModel, provider, setProvider, agent, setAgent, modelList, onChatStart }: ChatImplProps) => {
    useShortcuts();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [chatStarted, setChatStarted] = useState(initialMessages?.length ? initialMessages.length > 0 : false);
    const { showChat } = useStore(chatStore);
    const [animationScope, animate] = useAnimate();
    const { messages, isLoading, input, handleInputChange, setInput, stop, append } = useChat({
      api: '/api/chat',
      onError: (error) => {
        logger.error('Request failed\n\n', error);
        toast.error('There was an error processing your request');
      },
      onFinish: () => {
        logger.debug('Finished streaming');
      },
      initialMessages,
    });

    const { enhancingPrompt, promptEnhanced, enhancePrompt: rawEnhancePrompt } = usePromptEnhancer();
    const { parsedMessages, parseMessages } = useMessageParser();

    useEffect(() => {
      setChatStarted(initialMessages?.length ? initialMessages.length > 0 : false);
    }, [initialMessages]);

    useEffect(() => {
      parseMessages(messages, isLoading);

      if (messages.length > (initialMessages?.length || 0)) {
        storeMessageHistory?.(messages).catch((error) => toast.error(error.message));
      }
    }, [messages, isLoading, parseMessages, initialMessages, storeMessageHistory]);

    const runAnimation = async () => {
      if (chatStarted) {
        return;
      }

      await animate('#examples', { opacity: 0, display: 'none' }, { duration: 0.1 });
      await animate('#intro', { opacity: 0, flex: 1 }, { duration: 0.2, ease: cubicEasingFn });

      chatStore.setKey('started', true);
      setChatStarted(true);
      onChatStart();
    };

    const sendMessage = async (_event: React.UIEvent, messageInput?: string) => {
      const _input = messageInput || input;

      if (_input.length === 0 || isLoading) {
        return;
      }

      await workbenchStore.saveAllFiles();
      chatStore.setKey('aborted', false);
      runAnimation();

      append({ role: 'user', content: _input });
      setInput('');
      textareaRef.current?.blur();
    };

    const handleFileAttach = async (file: File) => {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          runAnimation();
          append({
            role: 'user',
            content: `[Attached File: ${file.name}]\n\n${content}`,
          });
        };
        reader.readAsText(file);
      } catch (error) {
        toast.error('Error reading file');
        logger.error('File reading error:', error);
      }
    };

    const handleEnhancePrompt = () => {
      rawEnhancePrompt(input, (newInput: string) => {
        setInput(newInput);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, chatStarted ? 400 : 200)}px`;
        }
      });
    };

    return (
      <BaseChat
        ref={animationScope}
        textareaRef={textareaRef}
        input={input}
        showChat={showChat}
        chatStarted={chatStarted}
        isStreaming={isLoading}
        messages={messages}
        model={model}
        setModel={setModel}
        provider={provider}
        setProvider={setProvider}
        agent={agent}
        setAgent={setAgent}
        sendMessage={sendMessage}
        handleInputChange={handleInputChange}
        handleStop={stop}
        onFileAttach={handleFileAttach}
        enhancingPrompt={enhancingPrompt}
        promptEnhanced={promptEnhanced}
        enhancePrompt={handleEnhancePrompt}
      />
    );
  },
);

import type { Message } from 'ai';
import React, { type RefCallback, useEffect, useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { PromptLibrary } from '~/components/promptLibrary/PromptLibrary.client';
import { SavePromptDialog } from '~/components/promptLibrary/SavePromptDialog.client';
import { promptLibraryStore } from '~/lib/stores/promptLibrary';
import { Workbench } from '~/components/workbench/Workbench.client';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { MessageContainer, Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { useStore } from '@nanostores/react';
import { sidebarOpen } from '~/lib/stores/sidebarStore';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import styles from './BaseChat.module.scss';
import { AGENT_LIST } from '~/utils/constants';
import type { AgentInfo } from '~/utils/types';

const AGENT_TYPES = [
  'Requirement Mapping',
  'Greenfield Code Synthesis',
  'Brownfield Code Evolution',
  'Test Blueprint Creator',
  'Deployment Orchestrator',
] as const;
type AgentType = (typeof AGENT_TYPES)[number];

const isGreenfieldAgent = (agent: AgentType): boolean => {
  return agent === 'Greenfield Code Synthesis';
};

const isRequirementMappingAgent = (agent: AgentType): boolean => {
  return agent === 'Requirement Mapping';
};
import { AssistantMessage } from './AssistantMessage';
import { Markdown } from './Markdown';
import MDEditor from '@uiw/react-md-editor/nohighlight';

interface ExamplePrompt {
  text: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [];

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model: string;
  setModel: (model: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  agent: AgentType;
  setAgent: (agent: string) => void;
  platform?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  onFileAttach?: (file: File) => void;
}

interface DocContainerProps {
  message: Message;
  isStreaming: boolean;
}

const DocContainer = ({ message, isStreaming }: DocContainerProps) => {
  return (
    <div
      className={classNames(
        'flex gap-4 p-6 w-full rounded-[calc(0.75rem-1px)] group',
        'bg-bolt-elements-messages-background bg-gradient-to-b from-bolt-elements-messages-background from-30% to-transparent mt-4',
      )}
    >
      <div className="grid grid-col-1 w-full">{<AssistantMessage content={message.content} />}</div>
    </div>
  );
};

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      model,
      setModel,
      provider,
      setProvider,
      agent,
      setAgent,
      sendMessage,
      handleInputChange,
      handleStop,
      enhancePrompt,
      onFileAttach,
    },
    ref,
  ) => {
    const open = useStore(sidebarOpen);
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [promptToSave, setPromptToSave] = useState('');
    const [mounted, setMounted] = React.useState(false);
    const [codeEditor, setCodeEditor] = useState(false);
    const [doc, setDoc] = useState<string>('');
    const [editing, setEditing] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const documentEditorRef = useRef<HTMLDivElement>(null);

    console.log(messages);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0 && onFileAttach) {
        onFileAttach(files[0]);
      }
    };

    // useEffect(async () => {
    //   fetch('http://localhost:8000/generate-trd').then((response) => {
    //     console.log(response);
    //     return response;
    //   });

    //   const response = await fetch('http://localhost:8000/generate-trd', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       epic_description:
    //         'a registration module for a patient, which displays when the user selects ‘Create New Account’ on the login page from the Patient Portal. It ensures the creation of a new account by capturing unique username and password, verifying the email ID, and handling OTP verification.',
    //     }),
    //   });

    //   console.log(response);

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const result = await response.json();
    //   console.log('Success:', result);
    // }, []);

    // useEffect(async() => {
    //   const response = await fetch('http://localhost:8000/generate-code', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       content: doc,
    //       language: "python"
    //     }),
    //   });

    //   console.log(response);

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const result = await response.json();
    //   console.log('Success:', result);
    // }, []);

    const downloadPDF = (content: string) => {
      const newDoc = new jsPDF();
      newDoc.text(doc, 10, 10);
      newDoc.save('TRD.pdf');
    };

    console.log(doc);

    const sendJiraToTRD = async (data: string) => {
      console.log(data);
      setRequestSent(true);
      try {
        const response = await fetch('http://localhost:8000/generate-trd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            epic_description: data,
          }),
        });

        console.log(response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = (await response.json()) as { data: { trd: string } };
        console.log('Success:', result);

        if (result?.data?.trd) {
          setDoc(result.data.trd);
        }

        setRequestSent(false);
        // Ensure the doc is updated before scrolling
        setTimeout(() => {
          if (documentEditorRef.current && response.ok) {
            documentEditorRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100); // Adjust the timeout as needed
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const saveFileToWorkbench = async (filePath: string, content: string) => {
      const fullPath = `/home/project${filePath}`;
      workbenchStore.setCurrentDocumentContent(content.trim());
      workbenchStore.setSelectedFile(fullPath);
      await workbenchStore.saveFile(fullPath);
    };

    const sendTRDToCode = async (data: string) => {
      
      try {
        // Use static response for testing
        const result = {
          data: {
            code: {
              "/project_root/app.py": "from flask import Flask\napp = Flask(__name__)\n\n@app.route('/')\ndef hello():\n    return 'Hello World!'",
              "/project_root/requirements.txt": "flask==2.0.1\nWerkzeug==2.0.1",
              "/project_root/README.md": "# Flask Hello World\n\nA simple Flask application."
            }
          }
        };

        // Show workbench before processing files
        workbenchStore.showWorkbench.set(true);

        // Process and save each file
        for (const [filePath, content] of Object.entries(result.data.code)) {
          console.log(`Processing file: ${filePath}`);
          console.log(`Content: ${content}`);
          // Convert project_root to home/project for consistency
          const normalizedPath = filePath.replace('/project_root', '/home/project');
          
          // Set the content and save the file
          workbenchStore.setCurrentDocumentContent(content);
          workbenchStore.setSelectedFile(normalizedPath);
          workbenchStore.saveFile(normalizedPath);
          console.log(workbenchStore.selectedFile.get());
          console.log(workbenchStore.unsavedFiles.get());
          console.log(workbenchStore.files.get());
          console.log(workbenchStore.saveFile(normalizedPath));
        }

        // Select the first file to display
        const files = workbenchStore.files.get();
        console.log(files)
        const firstFilePath = Object.keys(files)[0];
        console.log(firstFilePath)
        if (firstFilePath) {
          workbenchStore.setSelectedFile(firstFilePath);
        }

        toast.success('Code generated successfully');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to generate code');
      }
    };

    console.log(workbenchStore.files)

    return (
      <div className="overflow-auto">
        <div
          ref={ref}
          className={classNames(
            styles.BaseChat,
            'relative flex h-full w-full overflow-auto bg-bolt-elements-background-depth-1',
          )}
          data-chat-visible={showChat}
        >
          <ClientOnly>{() => null}</ClientOnly>
          <div className="flex h-full w-full overflow-hidden relative">
            <ClientOnly>
              {() => (
                <div
                  style={{
                    width: open ? 0 : 0,
                    transition: 'width 0.3s ease',
                  }}
                >
                  <Menu />
                </div>
              )}
            </ClientOnly>
            <div
              ref={scrollRef}
              className={`flex flex-grow overflow-hidden ${!isRequirementMappingAgent(agent) && 'h-full'} transition-all duration-300 ease-in-out`}
              style={{
                marginLeft: open ? 350 : 0,
                marginRight: 'auto',
                width: '100%',
                maxWidth: '100%',
                transition: 'margin-left 0.3s ease',
              }}
            >
              <div className={classNames(styles.Chat, 'flex flex-col flex-grow min-w-[var(--chat-min-width)]')}>
                <div id="intro" className="mt-[26vh] max-w-chat mx-auto">
                  <h1 className="text-5xl text-center font-bold text-bolt-elements-textPrimary mb-2">{agent}</h1>
                  <p className="mb-4 text-center text-bolt-elements-textSecondary">
                    {/* Build, Refactor, Deploy full stack apps with AI */}
                    {AGENT_LIST.map((item) => item.name === agent && item.desc)}
                  </p>
                </div>
                {isRequirementMappingAgent(agent) ? (
                  <div
                    className={classNames('pt-6 px-6', {
                      'overflow-y-auto mt-6 flex flex-col': chatStarted,
                    })}
                  >
                    <div
                      className={classNames('relative w-full max-w-chat mx-auto z-prompt', {
                        'sticky bottom-0': chatStarted,
                      })}
                    >
                      <div
                        className={classNames(
                          'shadow-sm border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[8px] rounded-lg overflow-hidden',
                        )}
                      >
                        <textarea
                          // ref={textareaRef}
                          className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent`}
                          // onKeyDown={() => sendJiraToTRD(input)}
                          value={input}
                          onChange={(event) => {
                            handleInputChange?.(event);
                          }}
                          style={{
                            minHeight: TEXTAREA_MIN_HEIGHT,
                            maxHeight: TEXTAREA_MAX_HEIGHT,
                          }}
                          placeholder="How can BuildXtreme.ai help you today?"
                          translate="no"
                        />
                        <ClientOnly>
                          {() => (
                            <SendButton
                              show={input.length > 0 || isStreaming}
                              isStreaming={requestSent}
                              onClick={() => sendJiraToTRD(input)}
                            />
                          )}
                        </ClientOnly>
                        <div className="flex justify-between text-sm p-4 pt-2">
                          <div className="flex gap-2 items-center">
                            <IconButton
                              title="Open Prompt Library"
                              onClick={() => promptLibraryStore.set({ ...promptLibraryStore.get(), showDialog: true })}
                              className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                            >
                              <div className="i-ph:book-bookmark text-xl" />
                            </IconButton>

                            <IconButton
                              title="Save to Prompt Library"
                              disabled={input.length === 0}
                              onClick={() => {
                                setPromptToSave(input);
                                setShowSaveDialog(true);
                              }}
                              className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                            >
                              <div className="i-ph:bookmark-simple text-xl" />
                            </IconButton>

                            <IconButton
                              title="Enhance prompt"
                              disabled={input.length === 0 || enhancingPrompt}
                              className={classNames({
                                'opacity-100!': enhancingPrompt,
                                'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                                  promptEnhanced,
                              })}
                              onClick={() => enhancePrompt?.()}
                            >
                              {enhancingPrompt ? (
                                <>
                                  <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl"></div>
                                  <div className="ml-1.5">Enhancing prompt...</div>
                                </>
                              ) : (
                                <>
                                  <div className="i-bolt:stars text-xl"></div>
                                  {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                                </>
                              )}
                            </IconButton>
                            {input.length > 3 ? (
                              <div className="text-xs text-bolt-elements-textTertiary">
                                Use <kbd className="kdb">Shift</kbd> + <kbd className="kdb">Return</kbd> for a new line
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <ClientOnly>
                          {() => (
                            <>
                              <SavePromptDialog
                                open={showSaveDialog}
                                onOpenChange={setShowSaveDialog}
                                content={promptToSave}
                                source="input"
                              />
                              <PromptLibrary
                                onSelect={(content) => {
                                  if (handleInputChange) {
                                    const event = {
                                      target: { value: content },
                                    } as React.ChangeEvent<HTMLTextAreaElement>;
                                    handleInputChange(event);
                                  }
                                }}
                              />
                            </>
                          )}
                        </ClientOnly>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={classNames('pt-6 px-6', {
                      'h-full overflow-y-auto mt-6 flex flex-col': chatStarted,
                    })}
                  >
                    <ClientOnly>
                      {() => {
                        return chatStarted ? (
                          <Messages
                            ref={messageRef}
                            className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                            messages={messages}
                            isStreaming={isStreaming}
                          />
                        ) : null;
                      }}
                    </ClientOnly>
                    <div
                      className={classNames('relative w-full max-w-chat mx-auto z-prompt', {
                        'sticky bottom-0': chatStarted,
                      })}
                    >
                      <div
                        className={classNames(
                          'shadow-sm border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[8px] rounded-lg overflow-hidden',
                        )}
                      >
                        <textarea
                          ref={textareaRef}
                          className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent`}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              if (event.shiftKey) {
                                return;
                              }

                              event.preventDefault();

                              if (isGreenfieldAgent(agent)) {
                                sendTRDToCode(input);
                              } else {
                                sendMessage?.(event);
                              }
                            }
                          }}
                          value={input}
                          onChange={(event) => {
                            handleInputChange?.(event);
                          }}
                          style={{
                            minHeight: TEXTAREA_MIN_HEIGHT,
                            maxHeight: TEXTAREA_MAX_HEIGHT,
                          }}
                          placeholder="How can BuildXtreme.ai help you today?"
                          translate="no"
                        />
                        <ClientOnly>
                          {() => (
                            <SendButton
                              show={input.length > 0 || isStreaming}
                              isStreaming={isStreaming}
                              onClick={(event) => {
                                if (isStreaming) {
                                  handleStop?.();
                                  return;
                                }

                                if (isGreenfieldAgent(agent)) {
                                  sendTRDToCode(input);
                                } else {
                                  sendMessage?.(event);
                                }
                              }}
                            />
                          )}
                        </ClientOnly>
                        <div className="flex justify-between text-sm p-4 pt-2">
                          <div className="flex gap-2 items-center">
                            <IconButton
                              title="Open Prompt Library"
                              onClick={() => promptLibraryStore.set({ ...promptLibraryStore.get(), showDialog: true })}
                              className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                            >
                              <div className="i-ph:book-bookmark text-xl" />
                            </IconButton>

                            <IconButton
                              title="Save to Prompt Library"
                              disabled={input.length === 0}
                              onClick={() => {
                                setPromptToSave(input);
                                setShowSaveDialog(true);
                              }}
                              className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                            >
                              <div className="i-ph:bookmark-simple text-xl" />
                            </IconButton>

                            <IconButton
                              title="Enhance prompt"
                              disabled={input.length === 0 || enhancingPrompt}
                              className={classNames({
                                'opacity-100!': enhancingPrompt,
                                'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                                  promptEnhanced,
                              })}
                              onClick={() => enhancePrompt?.()}
                            >
                              {enhancingPrompt ? (
                                <>
                                  <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl"></div>
                                  <div className="ml-1.5">Enhancing prompt...</div>
                                </>
                              ) : (
                                <>
                                  <div className="i-bolt:stars text-xl"></div>
                                  {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                                </>
                              )}
                            </IconButton>

                            {/* Add Attachment Button */}
                            <label className="cursor-pointer">
                              <input type="file" onChange={handleFileChange} className="hidden" accept="*/*" />
                              <IconButton
                                title="Attach File"
                                className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                              >
                                <div className="i-ph:paperclip text-xl" />
                              </IconButton>
                            </label>
                          </div>
                          {input.length > 3 ? (
                            <div className="text-xs text-bolt-elements-textTertiary">
                              Use <kbd className="kdb">Shift</kbd> + <kbd className="kdb">Return</kbd> for a new line
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="bg-bolt-elements-background-depth-1 pb-6">{/* Ghost Element */}</div>

                      <ClientOnly>
                        {() => (
                          <>
                            <SavePromptDialog
                              open={showSaveDialog}
                              onOpenChange={setShowSaveDialog}
                              content={promptToSave}
                              source="input"
                            />
                            <PromptLibrary
                              onSelect={(content) => {
                                if (handleInputChange) {
                                  const event = {
                                    target: { value: content },
                                  } as React.ChangeEvent<HTMLTextAreaElement>;
                                  handleInputChange(event);
                                }
                              }}
                            />
                          </>
                        )}
                      </ClientOnly>
                    </div>
                  </div>
                )}
                {!chatStarted && (
                  <div id="examples" className="relative w-full max-w-xl mx-auto mt-8 flex justify-center">
                    <div className="flex flex-col space-y-2 [mask-image:linear-gradient(to_bottom,black_0%,transparent_180%)] hover:[mask-image:none]">
                      {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                        return (
                          <button
                            key={index}
                            onClick={(event) => {
                              sendMessage?.(event, examplePrompt.text);
                            }}
                            className="group flex items-center w-full gap-2 justify-center bg-transparent text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary transition-theme"
                          >
                            {examplePrompt.text}
                            <div className="i-ph:arrow-bend-down-left" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {!isRequirementMappingAgent(agent) && (
                <div className="relative ml-4">
                  <ClientOnly>
                    {() => <Workbench chatStarted={true} isStreaming={isStreaming} agent={agent} />}
                  </ClientOnly>
                </div>
              )}
            </div>
          </div>
        </div>
        {isRequirementMappingAgent(agent) && doc && (
          <div id="doc-editor" ref={documentEditorRef} className="relative overflow-y-auto m-4 h-full">
            {/* <DocContainer message={messages[messages?.length - 1]}  isStreaming={isStreaming} isFirst={false} isLast={true}/> */}
            <MDEditor
              height={800}
              preview={editing ? 'live' : 'preview'}
              value={doc}
              autoFocus={false}
              onChange={(value) => value !== undefined && setDoc(value)}
            />
            {doc && isGreenfieldAgent(agent) && (
              <button
                onClick={() => sendTRDToCode(doc)}
                className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Generate Code
              </button>
            )}

            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-300 p-4 rounded-lg shadow-lg flex space-x-4">
              <button onClick={() => setEditing(true)} className="bg-transparent hover:text-gray-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
              <button onClick={() => downloadPDF(doc)} className="bg-transparent hover:text-gray-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { toggleSidebar } from '~/lib/stores/sidebarStore';
import { ModelSelector } from './ModelSelector';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import { useState, useEffect, useRef } from 'react';
import { AgentSelector } from './AgentSelector';

interface HeaderProps {
  model: string;
  setModel: (model: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  agent: string;
  setAgent: (agent: string) => void;
  modelList: typeof import('~/utils/constants').MODEL_LIST;
  agentList: typeof import('~/utils/constants').AGENT_LIST;
  platformList: typeof import('~/utils/constants').PLATFORM_LIST;
  chatStarted: boolean;
}

export function Header({
  model,
  setModel,
  provider,
  setProvider,
  agent,
  setAgent,
  modelList,
  agentList,
  platformList,
  chatStarted,
}: HeaderProps) {
  const chat = useStore(chatStore);
  const providerList = [...new Set(modelList.map((model) => model.provider))];
  const agentsList = [...new Set(agentList)];
  const platformsList = [...new Set(platformList)];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('BuildXtreme AI');
  const [isPlatformOpen, setIsPlatformOpen] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);

  console.log(platformList)

  useEffect(() => {
    if (localStorage.getItem('activePlatform')) {
      const temp = localStorage.getItem('activePlatform');
      setSelectedPlatform(temp);
    }
  }, []);

  const togglePlatformDropdown = () => {
    setIsPlatformOpen((prev) => !prev);
    // setIsModelOpen(false);
  };

  const handlePlatformSelection = (option: string) => {
    setSelectedPlatform(option);
    localStorage.setItem('activePlatform', option);
    togglePlatformDropdown();
  };

  // const availablePlatforms = ['BuildXtreme AI', 'CodeThrust (CT)'];
  console.log(model);
  console.log(agent);
  return (
    <>
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleSidebar()}
            aria-label="Toggle Sidebar"
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="i-ph:sidebar-simple-duotone text-xl text-gray-700" />
          </button>
          <div className="relative">
            <div
              className="inline-flex justify-center items-center cursor-pointer"
              ref={platformRef}
              id="platform-selector"
              aria-haspopup="true"
              aria-expanded={isPlatformOpen}
              onClick={togglePlatformDropdown}
            >
              <h1 className="text-xl font-bold text-gray-900 select-none">{selectedPlatform}</h1>
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {isPlatformOpen && (
              <div className="origin-top-center absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="platform-selector">
                  {platformsList.map((platformOption) => (
                    <button
                      key={platformOption.name}
                      className={classNames(
                        'block w-full text-left px-4 py-2 text-sm',
                        selectedPlatform === platformOption.name ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      )}
                      role="menuitem"
                      onClick={() => handlePlatformSelection(platformOption.name)}
                    >
                      {platformOption.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          {selectedPlatform === 'BuildXtreme AI' ? (
            <ModelSelector
              model={model}
              setModel={setModel}
              provider={provider}
              setProvider={setProvider}
              modelList={modelList}
              providerList={providerList}
            />
          ) : (
            <AgentSelector agentList={agentsList} agent={agent} setAgent={setAgent} />
          )}
          {agent != 'Requirement Mapping'&&<ClientOnly>{() => <WorkbenchButtons chatStarted={chatStarted} />}</ClientOnly>}
          <button className="bg-transparent" onClick={() => setIsSidebarOpen(true)}>
            <div className="i-ph:gear text-lg" />
          </button>
        </div>
      </header>
      <div
        className={`fixed z-99 inset-0 bg-black bg-opacity-50 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <div
        className={`fixed z-100 inset-y-0 right-0 max-w-full flex transition-transform transform border border-gray-300 shadow-lg ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
            <div className="px-4 py-6 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Settings</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative flex flex-col space-y-4 px-4 sm:px-6">
              <ClientOnly>{() => <Settings chatStarted={chatStarted} />}</ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function WorkbenchButtons({ chatStarted }: { chatStarted: boolean }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showWorkbench, setShowWorkbench] = useState(false);

  useEffect(() => {
    const initWorkbench = async () => {
      const { workbenchStore } = await import('~/lib/stores/workbench');
      setShowWorkbench(workbenchStore.showWorkbench.get());
      workbenchStore.showWorkbench.listen((value) => setShowWorkbench(value));
    };
    initWorkbench();
  }, []);

  const handleSyncFiles = async () => {
    const { workbenchStore } = await import('~/lib/stores/workbench');
    const { toast } = await import('react-toastify');

    setIsSyncing(true);
    try {
      const directoryHandle = await window.showDirectoryPicker();
      await workbenchStore.syncFiles(directoryHandle);
      toast.success('Files synced successfully');
    } catch (error) {
      console.error('Error syncing files:', error);
      toast.error('Failed to sync files');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleTerminal = async () => {
    const { workbenchStore } = await import('~/lib/stores/workbench');
    workbenchStore.toggleTerminal(!workbenchStore.showTerminal.get());
  };

  const handleToggleWorkbench = async () => {
    const { workbenchStore } = await import('~/lib/stores/workbench');
    const newShowWorkbench = !showWorkbench;
    workbenchStore.showWorkbench.set(newShowWorkbench);
    setShowWorkbench(newShowWorkbench);
  };

  return (
    <>
      <PanelHeaderButton className="text-sm" onClick={handleToggleWorkbench}>
        <div className="i-ph:code mr-2" />
        Toggle Code Editor
      </PanelHeaderButton>
      <PanelHeaderButton className="text-sm" onClick={handleSyncFiles} disabled={isSyncing}>
        {isSyncing ? <div className="i-ph:spinner mr-2" /> : <div className="i-ph:cloud-arrow-down mr-2" />}
        {isSyncing ? 'Syncing...' : 'Sync Files'}
      </PanelHeaderButton>
      <PanelHeaderButton className="text-sm" onClick={handleToggleTerminal}>
        <div className="i-ph:terminal mr-2" />
        Toggle Terminal
      </PanelHeaderButton>
    </>
  );
}

function Settings({ chatStarted }: { chatStarted: boolean }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleDownloadZip = async () => {
    const { workbenchStore } = await import('~/lib/stores/workbench');
    workbenchStore.downloadZip();
  };

  const handlePushToGitHub = async () => {
    const { workbenchStore } = await import('~/lib/stores/workbench');

    const repoName = prompt('Please enter a name for your new GitHub repository:', 'bolt-generated-project');
    if (!repoName) {
      alert('Repository name is required. Push to GitHub cancelled.');
      return;
    }
    const githubUsername = prompt('Please enter your GitHub username:');
    if (!githubUsername) {
      alert('GitHub username is required. Push to GitHub cancelled.');
      return;
    }
    const githubToken = prompt('Please enter your GitHub personal access token:');
    if (!githubToken) {
      alert('GitHub token is required. Push to GitHub cancelled.');
      return;
    }

    workbenchStore.pushToGitHub(repoName, githubUsername, githubToken);
  };

  return (
    <>
      <PanelHeaderButton className="text-lg" onClick={handleDownloadZip}>
        <div className="i-ph:download-simple mr-2" />
        Download Code
      </PanelHeaderButton>
      <PanelHeaderButton className="text-lg" onClick={handlePushToGitHub}>
        <div className="i-ph:github-logo mr-2" />
        Push to GitHub
      </PanelHeaderButton>
    </>
  );
}

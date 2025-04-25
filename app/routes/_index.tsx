import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { useState } from 'react';
import { Header } from '~/components/header/Header';
import { Chat } from '~/components/chat/Chat.client';
import { MODEL_LIST, DEFAULT_PROVIDER, AGENT_LIST, PLATFORM_LIST } from '~/utils/constants';

export const meta: MetaFunction = () => {
  return [
    { title: 'BuildXtreme.ai' },
    { name: 'description', content: 'Talk to BuildXtreme.ai, an AI assistant from CitiusTech' },
  ];
};

export const loader = () => json({});

export default function Index() {
  const [model, setModel] = useState(MODEL_LIST[0]?.name || '');
  const [agent, setAgent] = useState(AGENT_LIST[0]?.name || '');
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [chatStarted, setChatStarted] = useState(false);

  return (
    <div className="flex flex-col h-full w-full">
      <Header
        model={model}
        agent={agent}
        setModel={setModel}
        setAgent={setAgent}
        provider={provider}
        setProvider={setProvider}
        modelList={MODEL_LIST}
        agentList={AGENT_LIST}
        platformList={PLATFORM_LIST}
        chatStarted={chatStarted}
      />
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => (
          <Chat
            agent={agent}
            setAgent={setAgent}
            model={model}
            setModel={setModel}
            provider={provider}
            setProvider={setProvider}
            modelList={MODEL_LIST}
            onChatStart={() => setChatStarted(true)}
          />
        )}
      </ClientOnly>
    </div>
  );
}

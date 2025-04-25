import React, { useState, useRef, useEffect } from 'react';
import { classNames } from '~/utils/classNames';

interface AgentSelectorProps {
  agent: string;
  setAgent: (agent: string) => void;
  agentList: typeof import('~/utils/constants').AGENT_LIST;
}

export function AgentSelector({ agent, setAgent, agentList }: AgentSelectorProps) {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const agentRef = useRef<HTMLDivElement>(null);
  const selectedAgent = agent || 'Requirement Mapping';
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (agentRef.current && !agentRef.current.contains(event.target as Node)) {
        setIsAgentOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleAgentDropdown = () => {
    setIsAgentOpen((prev) => !prev);
    setIsModelOpen(false);
  };

  const handleAgentSelect = (agentOption: string) => {
    setAgent(agentOption);
    setIsAgentOpen(false);
  };

  // const availableAgents = [agentList]
  // const filteredAgents = agentList.filter((m) => m.name === agent);

  return (
    <>
      <div ref={agentRef} className="relative inline-block text-left">
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="agent-selector"
          aria-haspopup="true"
          aria-expanded={isAgentOpen}
          onClick={toggleAgentDropdown}
        >
          {selectedAgent}
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
        </button>

        {isAgentOpen && (
          <div className="origin-top-center absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="agent-selector">
              {agentList.map((agentOption) => (
                <button
                  key={agentOption.name}
                  className={classNames(
                    'block w-full text-left px-4 py-2 text-sm',
                    selectedAgent === agentOption.name ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  )}
                  title={agentOption.desc}
                  role="menuitem"
                  onClick={() => handleAgentSelect(agentOption.name)}
                >
                  {agentOption.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

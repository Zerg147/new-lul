import React, { useState, useRef, useEffect } from 'react';
import { classNames } from '~/utils/classNames';

interface ModelSelectorProps {
  model: string;
  setModel: (model: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  modelList: typeof import('~/utils/constants').MODEL_LIST;
  providerList: string[];
}

export function ModelSelector({ model, setModel, provider, setProvider, modelList, providerList }: ModelSelectorProps) {
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const providerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const selectedProvider = provider || 'Select a provider';
  const selectedModel = model || 'Select a model';

  const filteredModels = modelList.filter((m) => m.provider === provider);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (providerRef.current && !providerRef.current.contains(event.target as Node)) {
        setIsProviderOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setIsModelOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProviderDropdown = () => {
    setIsProviderOpen((prev) => !prev);
    setIsModelOpen(false);
  };

  const toggleModelDropdown = () => {
    if (provider) {
      setIsModelOpen((prev) => !prev);
      setIsProviderOpen(false);
    }
  };

  const handleProviderSelect = (providerOption: string) => {
    setProvider(providerOption);
    const providerModels = modelList.filter((m) => m.provider === providerOption);
    if (providerModels.length > 0) {
      setModel(providerModels[0].name);
    } else {
      setModel('');
    }
    setIsProviderOpen(false);
  };

  return (
    <>
      <div ref={providerRef} className="relative inline-block text-left">
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="provider-selector"
          aria-haspopup="true"
          aria-expanded={isProviderOpen}
          onClick={toggleProviderDropdown}
        >
          {selectedProvider}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isProviderOpen && (
          <div className="origin-top-center absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="provider-selector">
              {providerList.map((providerOption) => (
                <button
                  key={providerOption}
                  className={classNames(
                    'block w-full text-left px-4 py-2 text-sm',
                    provider === providerOption ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  )}
                  role="menuitem"
                  onClick={() => handleProviderSelect(providerOption)}
                >
                  {providerOption}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={modelRef} className="relative inline-block text-left">
        <button
          type="button"
          className={classNames(
            "inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
            { "opacity-50 cursor-not-allowed": !provider }
          )}
          id="model-selector"
          aria-haspopup="true"
          aria-expanded={isModelOpen}
          onClick={toggleModelDropdown}
          disabled={!provider}
        >
          {selectedModel}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isModelOpen && (
          <div className="origin-top-center absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="model-selector">
              {filteredModels.map((modelOption) => (
                <button
                  key={modelOption.name}
                  className={classNames(
                    'block w-full text-left px-4 py-2 text-sm',
                    model === modelOption.name ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  )}
                  role="menuitem"
                  onClick={() => {
                    setModel(modelOption.name);
                    setIsModelOpen(false);
                  }}
                >
                  {modelOption.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

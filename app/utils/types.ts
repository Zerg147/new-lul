
interface OllamaModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: OllamaModelDetails;
}

export interface OllamaApiResponse {
  models: OllamaModel[];
}

export interface ModelInfo {
  name: string;
  label: string;
  provider: string;
}

export interface AgentInfo {
  name: string;
  desc: string;
}

export interface PlatformInfo {
  name: string;
  desc: string;
}

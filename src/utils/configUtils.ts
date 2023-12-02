import { type WorkspaceConfiguration, workspace } from "vscode";

export const getConfiguration = (section: string): WorkspaceConfiguration => {
  return workspace.getConfiguration(section);
};

export const getConfigurationKey = (configuration: WorkspaceConfiguration, key: string) => {
  return configuration.get(key);
};

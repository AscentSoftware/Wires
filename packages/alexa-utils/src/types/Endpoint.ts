export interface Capability {
  type: string;
  interface: string;
  version: string;
  proactivelyReported?: boolean;
  retrievable?: boolean;
}

export interface Endpoint {
  endpointId: string;
  friendlyName?: string;
  description?: string;
  manufaturerName?: string;
  displayCategories: string[];
  cookies: {};
  capabilities: Capability[];
}

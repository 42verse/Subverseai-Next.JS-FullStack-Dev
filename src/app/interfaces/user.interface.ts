export enum EUserRole {
  COMPANY = 'company',
  USER = 'user',
  AGENT = 'agent'
}

export interface AgentDropdownList {
  _id: string;
  name: string;
  username: string;
}
export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type RunId = Brand<string, 'RunId'>;
export type ActionId = Brand<string, 'ActionId'>;
export type EntityId = Brand<string, 'EntityId'>;
export type ContentId = Brand<string, 'ContentId'>;
export type CohortId = Brand<string, 'CohortId'>;
export type CustomerId = Brand<string, 'CustomerId'>;
export type AgentId = Brand<string, 'AgentId'>;
export type QueueItemId = Brand<string, 'QueueItemId'>;

export const asRunId = (value: string) => value as RunId;
export const asActionId = (value: string) => value as ActionId;
export const asEntityId = (value: string) => value as EntityId;
export const asContentId = (value: string) => value as ContentId;
export const asCohortId = (value: string) => value as CohortId;
export const asCustomerId = (value: string) => value as CustomerId;
export const asAgentId = (value: string) => value as AgentId;
export const asQueueItemId = (value: string) => value as QueueItemId;

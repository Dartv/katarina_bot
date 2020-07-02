import { Client } from 'diskat';

export type Plugin = (client: Client) => void;

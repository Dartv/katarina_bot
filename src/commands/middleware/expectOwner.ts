import { Middleware, expectUser } from 'diskat';

export const expectOwner = (): Middleware => expectUser(process.env.OWNERS.split(','));

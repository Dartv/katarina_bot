import { IMarriage } from '../types';
import { MarriageStatus } from '../../../util';

export default async function marry(): Promise<IMarriage> {
  Object.assign(this, {
    status: MarriageStatus.MARRIED,
    marriedAt: new Date(),
  });

  await this.save();

  return this;
}

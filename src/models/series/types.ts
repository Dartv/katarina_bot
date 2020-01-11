import { Document, Model } from 'mongoose';

export interface ISeries extends Document {
  title: string;
  slug: string;
}

export interface ISeriesModel extends Model<ISeries> {
  getUpdatedSeries: (series: ISeries[]) => Promise<ISeries[]>;
}

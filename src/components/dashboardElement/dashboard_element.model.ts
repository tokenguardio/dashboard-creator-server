import mongoose from 'mongoose';
import { IDashboardElement } from './dashboard_element.interface';

const dashboardElementSchema = new mongoose.Schema<IDashboardElement>({
  title: { type: String, required: true },
  dimension: { type: String, required: true },
  differential: { type: String, required: true },
  measures: [{ type: String }],
});

const DashboardElementModel = mongoose.model<IDashboardElement>(
  'DashboardElement',
  dashboardElementSchema,
);

// eslint-disable-next-line import/prefer-default-export
export { DashboardElementModel };

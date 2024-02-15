import mongoose from 'mongoose';
import {
  IDashboardElement,
  IDashboardElementButton,
  IDashboardElementText,
  IDashboardElementBasicQuery,
  IDashboardElementCustomQuery,
} from './dashboardElement.interface';

const dashboardElementSchema = new mongoose.Schema<IDashboardElement>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
  },
  { discriminatorKey: 'type' }
);

const dashboardElementTextSchema = new mongoose.Schema<IDashboardElementText>({
  text: { type: String, required: true },
});

const dashboardElementButtonSchema = new mongoose.Schema<IDashboardElementButton>({
  text: { type: String, required: true },
  link: { type: String, required: true },
});

const dashboardElementBasicQuerySchema = new mongoose.Schema<IDashboardElementBasicQuery>({
  dimension: { type: String },
  differential: { type: String },
  measures: [{ type: String }],
  visType: { type: String, required: true },
});

const dashboardElementCustomQuerySchema = new mongoose.Schema<IDashboardElementCustomQuery>({
  queryId: { type: Number, required: true },
  visType: { type: String, required: true },
});

const DashboardElementModel = mongoose.model<IDashboardElement>('DashboardElement', dashboardElementSchema);
const DashboardElementButtonModel = DashboardElementModel.discriminator<IDashboardElementButton>('button', dashboardElementButtonSchema);
const DashboardElementTextModel = DashboardElementModel.discriminator<IDashboardElementText>('text', dashboardElementTextSchema);
const DashboardElementBasicQueryModel = DashboardElementModel.discriminator<IDashboardElementBasicQuery>('basicQuery', dashboardElementBasicQuerySchema);
const DashboardElementCustomQueryModel = DashboardElementModel.discriminator<IDashboardElementCustomQuery>('customQuery', dashboardElementCustomQuerySchema);

export {
  DashboardElementModel,
  DashboardElementButtonModel,
  DashboardElementTextModel,
  DashboardElementBasicQueryModel,
  DashboardElementCustomQueryModel,
};


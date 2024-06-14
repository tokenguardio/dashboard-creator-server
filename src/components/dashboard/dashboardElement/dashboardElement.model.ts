import mongoose from 'mongoose';
import {
  IDashboardElement,
  IDashboardElementButton,
  IDashboardElementText,
  IDashboardElementBasicQuery,
  IDashboardElementCustomQuery,
  IDashboardElementDappAnalytics,
} from './dashboardElement.interface';

const dashboardElementSchema = new mongoose.Schema<IDashboardElement>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
  },
  { discriminatorKey: 'type' },
);

const dashboardElementTextSchema = new mongoose.Schema<IDashboardElementText>({
  text: { type: String, required: true },
});

const dashboardElementButtonSchema =
  new mongoose.Schema<IDashboardElementButton>({
    text: { type: String, required: true },
    link: { type: String, required: true },
  });

const dashboardElementBasicQuerySchema =
  new mongoose.Schema<IDashboardElementBasicQuery>({
    dbname: { type: String },
    schema: { type: String },
    table: { type: String },
    dimension: { type: String },
    differential: { type: String },
    measures: [
      {
        columnName: { type: String },
        operator: { type: String },
      },
    ],
    visType: { type: String, required: true },
  });

const dashboardElementCustomQuerySchema =
  new mongoose.Schema<IDashboardElementCustomQuery>({
    queryId: { type: Number, required: true },
    visType: { type: String, required: true },
  });

const dashboardElementDappAnalyticsSchema =
  new mongoose.Schema<IDashboardElementDappAnalytics>({
    metric: {
      type: String,
      enum: ['wallets', 'transferred-tokens', 'interactions'],
      required: true,
    },
    breakdown: { type: Boolean, default: false },
    filters: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['call', 'event'], required: true },
        args: {
          type: Map,
          of: {
            type: {
              type: String,
              enum: ['integer', 'string', 'boolean'],
              required: true,
            },
            conditions: [
              {
                operator: {
                  type: String,
                  enum: ['>', '<', '>=', '<=', '=', '!='],
                  required: true,
                },
                value: { type: mongoose.Schema.Types.Mixed, required: true },
              },
            ],
            value: { type: mongoose.Schema.Types.Mixed },
          },
        },
      },
    ],
    visType: { type: String, required: true },
  });

const DashboardElementModel = mongoose.model<IDashboardElement>(
  'DashboardElement',
  dashboardElementSchema,
);
const DashboardElementButtonModel =
  DashboardElementModel.discriminator<IDashboardElementButton>(
    'button',
    dashboardElementButtonSchema,
  );
const DashboardElementTextModel =
  DashboardElementModel.discriminator<IDashboardElementText>(
    'text',
    dashboardElementTextSchema,
  );
const DashboardElementBasicQueryModel =
  DashboardElementModel.discriminator<IDashboardElementBasicQuery>(
    'basicQuery',
    dashboardElementBasicQuerySchema,
  );
const DashboardElementCustomQueryModel =
  DashboardElementModel.discriminator<IDashboardElementCustomQuery>(
    'customQuery',
    dashboardElementCustomQuerySchema,
  );
const DashboardElementDappAnalyticsModel =
  DashboardElementModel.discriminator<IDashboardElementDappAnalytics>(
    'dappAnalytics',
    dashboardElementDappAnalyticsSchema,
  );

export {
  DashboardElementModel,
  DashboardElementButtonModel,
  DashboardElementTextModel,
  DashboardElementBasicQueryModel,
  DashboardElementCustomQueryModel,
  DashboardElementDappAnalyticsModel,
};

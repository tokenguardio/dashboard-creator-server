import mongoose from 'mongoose';
import {
  IDashboardFilter,
  IDashboardFilterStatic,
  IDashboardFilterDynamic,
  IDashboardFilterDependent,
} from './dashboardFilter.interface';

const filterSchema = new mongoose.Schema<IDashboardFilter>({
  name: { type: String, required: true },
  options: [{ type: String }],
  type: {
    type: String,
    enum: ['static', 'dynamic', 'dependent'],
    required: true,
  },
  component: {
    type: String,
    enum: ['date_picker', 'select', 'multiselect', 'checkbox', 'radio'],
    required: true,
  },
  defaultValue: { type: mongoose.Schema.Types.Mixed, required: true },
});

const staticFilterSchema = new mongoose.Schema<IDashboardFilterStatic>({});

const dynamicFilterSchema = new mongoose.Schema<IDashboardFilterDynamic>({
  queryId: { type: Number, required: true },
  params: [{ type: String }],
});

const dependentFilterSchema = new mongoose.Schema<IDashboardFilterDependent>({
  queryId: { type: Number, required: true },
  params: [{ type: String, required: true }],
  reactsTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DashboardFilter' }],
});

const DashboardFilterModel = mongoose.model<IDashboardFilter>(
  'DashboardFilter',
  filterSchema,
);
const DashboardFilterStaticModel =
  DashboardFilterModel.discriminator<IDashboardFilter>(
    'static',
    staticFilterSchema,
  );
const DashboardFilterDynamicModel =
  DashboardFilterModel.discriminator<IDashboardFilter>(
    'dynamic',
    dynamicFilterSchema,
  );
const DashboardFilterDependentModel =
  DashboardFilterModel.discriminator<IDashboardFilter>(
    'dependent',
    dependentFilterSchema,
  );

export {
  DashboardFilterModel,
  DashboardFilterStaticModel,
  DashboardFilterDynamicModel,
  DashboardFilterDependentModel,
};

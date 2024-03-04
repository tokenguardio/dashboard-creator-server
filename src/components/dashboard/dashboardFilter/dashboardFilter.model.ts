import mongoose from 'mongoose';
import {
  IDashboardFilter,
  IDashboardFilterStatic,
  IDashboardFilterHidden,
  IDashboardFilterDynamic,
  IDashboardFilterDependent,
} from './dashboardFilter.interface';

const optionsSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const filterSchema = new mongoose.Schema<IDashboardFilter>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  options: [optionsSchema],
  type: {
    type: String,
    enum: ['static', 'hidden', 'dynamic', 'dependent'],
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

const hiddenFilterSchema = new mongoose.Schema<IDashboardFilterHidden>({});

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
const DashboardFilterHiddenModel =
  DashboardFilterModel.discriminator<IDashboardFilter>(
    'hidden',
    hiddenFilterSchema,
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
  DashboardFilterHiddenModel,
  DashboardFilterDynamicModel,
  DashboardFilterDependentModel,
};

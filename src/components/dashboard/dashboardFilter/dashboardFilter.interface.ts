import { Document } from 'mongoose';

interface IDashboardFilterValue {
  name: string;
  value: any;
}

interface IDashboardFilter extends Document {
  name: string;
  title: string;
  options: string[] | null;
  type: 'static' | 'dynamic' | 'dependent' | 'hidden';
  component: 'datePicker' | 'select' | 'multiselect' | 'checkbox' | 'radio';
  defaultValue: any;
}

interface IDashboardFilterStatic extends IDashboardFilter {
  type: 'static';
}

interface IDashboardFilterHidden extends IDashboardFilter {
  type: 'hidden';
}

interface IDashboardFilterDynamic extends IDashboardFilter {
  type: 'dynamic';
  queryId: number;
  params: string[];
}

interface IDashboardFilterDependent extends IDashboardFilter {
  type: 'dependent';
  queryId: number;
  params: string[];
  reactsTo: string[]; // dependent Filter _id
}

export {
  IDashboardFilterValue,
  IDashboardFilter,
  IDashboardFilterStatic,
  IDashboardFilterHidden,
  IDashboardFilterDynamic,
  IDashboardFilterDependent,
};

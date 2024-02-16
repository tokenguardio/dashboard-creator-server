import { Document } from 'mongoose';

interface IDashboardFilter extends Document {
  name: string;
  options: string[] | null;
  type: "static" | "dynamic" | "dependent";
  component: "datePicker" | "select" | "multiselect" | "checkbox" | "radio";
  defaultValue: any;
}

interface IDashboardFilterStatic extends IDashboardFilter{
  type: "static"
}

interface IDashboardFilterDynamic extends IDashboardFilter{
  type: "dynamic"
  queryId: number;
  params: string[];
}

interface IDashboardFilterDependent extends IDashboardFilter{
  type: "dependent"
  queryId: number;
  params: string[];
  reactsTo: string[]; // dependent Filter _id
}

export {
    IDashboardFilter,
    IDashboardFilterStatic,
    IDashboardFilterDynamic,
    IDashboardFilterDependent,
}

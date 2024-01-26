// dashboard.interface.ts

import { Document } from 'mongoose';
import { IDashboardElement } from '@components/dashboardElement/dashboard_element.interface';

interface IDashboard extends Document {
  _id: string;
  title: string;
  elements?: IDashboardElement[];
  layout?: ILayoutItem[];
  theme: ITheme;
}

interface ILayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
  // Other properties if needed
}

interface ITheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  additionalColor: string;
  bgColor: string;
  itemGridRadius: string;
  itemGridBgColor: string;
  font: string,
  textColor: string,
  itemGridStroke: string,
  chartGradient: boolean,
  bottomTimeline: boolean
}

interface IWriteDashboard extends Document {
  title: string;
  theme: ITheme;
}

export { IDashboard, ILayoutItem, ITheme, IWriteDashboard };


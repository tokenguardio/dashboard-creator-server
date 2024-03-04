import { Document } from 'mongoose';
import { IDashboardElement } from '@components/dashboard/dashboardElement/dashboardElement.interface';
import { IDashboardFilter } from '@components/dashboard/dashboardFilter/dashboardFilter.interface';

interface IDashboard extends Document {
  title: string;
  elements?: IDashboardElement[];
  layout?: ILayoutItem[];
  theme: ITheme;
  filters?: IDashboardFilter[];
}

interface ILayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

interface ITheme extends Document {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  additionalColor: string;
  bgColor: string;
  itemGridRadius: string;
  itemGridBgColor: string;
  font: string;
  textColor: string;
  itemGridStroke: string;
  chartGradient: boolean;
  bottomTimeline: boolean;
}

interface IWriteDashboard extends Document {
  title?: string;
  theme?: ITheme;
  layout?: ILayoutItem[];
}

export { IDashboard, ILayoutItem, ITheme, IWriteDashboard };

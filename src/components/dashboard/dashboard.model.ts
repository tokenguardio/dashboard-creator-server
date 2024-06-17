import mongoose from 'mongoose';
import {
  IDashboard,
  ILayoutItem,
  ITheme,
} from '@components/dashboard/dashboard.interface';

const layoutSchema = new mongoose.Schema<ILayoutItem>({
  id: { type: String, required: true, ref: 'DashboardElement' },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: { type: Number, required: true },
  h: { type: Number, required: true },
  static: { type: Boolean, default: false },
});

const themeSchema = new mongoose.Schema<ITheme>({
  name: { type: String, default: 'Custom Theme' },
  primaryColor: { type: String, default: '#48BD98' },
  secondaryColor: { type: String, default: '#0A425E' },
  additionalColor: { type: String, default: '#E6A627' },
  bgColor: { type: String, default: '#FFFFFF' },
  itemGridRadius: { type: String, default: '8px' },
  itemGridBgColor: { type: String, default: '#FFFFFF' },
  font: { type: String, default: 'Roboto' },
  textColor: { type: String, default: '#656565' },
  itemGridStroke: { type: String, default: '#ECECEC' },
  chartGradient: { type: Boolean, default: true },
  bottomTimeline: { type: Boolean, default: true },
});

const dashboardSchema = new mongoose.Schema<IDashboard & Document>({
  title: { type: String, required: true },
  dappId: { type: String, required: false },
  elements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DashboardElement' }],
  filters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DashboardFilter' }],
  layout: [layoutSchema],
  theme: themeSchema,
});

const DashboardModel = mongoose.model<IDashboard>('Dashboard', dashboardSchema);

// eslint-disable-next-line import/prefer-default-export
export { DashboardModel };

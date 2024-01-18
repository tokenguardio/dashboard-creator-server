import mongoose, { Schema, Document } from 'mongoose';
import {
  IDashboard,
  ILayoutItem,
  ITheme,
} from '@components/dashboard/dashboard.interface';

const layoutSchema = new Schema<ILayoutItem>({
  id: { type: String, required: true, ref: 'DashboardElement' },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: { type: Number, required: true },
  h: { type: Number, required: true },
  static: { type: Boolean, default: false },
  // Additional fields if needed
});

const themeSchema = new Schema<ITheme>({
  bgColor: { type: String, default: '#CBCBCB' },
  itemGridRadius: { type: String, default: '6px' },
  itemGridBgColor: { type: String, default: '#FFFFFF' },
});

const dashboardSchema = new Schema<IDashboard & Document>({
  title: { type: String, required: true },
  elements: [{ type: Schema.Types.ObjectId, ref: 'DashboardElement' }],
  layout: [layoutSchema],
  theme: themeSchema,
});

const DashboardModel = mongoose.model<IDashboard>('Dashboard', dashboardSchema);

// eslint-disable-next-line import/prefer-default-export
export { DashboardModel };

import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import { DashboardModel } from '@components/dashboard/dashboard.model';
import * as dashboardElementService from '@components/dashboardElement/dashboard_element.service';
import {
  IDashboard,
  IWriteDashboard,
} from '@components/dashboard/dashboard.interface';
import { IDashboardElement } from '@components/dashboardElement/dashboard_element.interface';

const create = async (dashboardData: IWriteDashboard): Promise<boolean> => {
  const newDashboard = await DashboardModel.create({
    ...dashboardData,
    elements: [],
    layout: [],
  });
  logger.debug(`Dashboard created: %O`, newDashboard);
  return true;
};

const read = async (id: string): Promise<IDashboard> => {
  logger.debug('log id', id);
  logger.debug(`Fetching dashboard with id ${id}`);
  const dashboard = await DashboardModel.findOne({ _id: id });
  logger.debug('log dashboard', dashboard);
  return dashboard as IDashboard;
};

const getAll = async (): Promise<IDashboard[]> => {
  logger.debug(`Fetching all dashboards`);
  const dashboards = await DashboardModel.find({});
  return dashboards as IDashboard[];
};

const update = async (dashboard: IWriteDashboard): Promise<boolean> => {
  const updatedDashboard = await DashboardModel.findOneAndUpdate(
    { id: dashboard.id },
    dashboard,
    { new: true },
  );
  logger.debug(`Dashboard updated: %O`, updatedDashboard);
  return true;
};

const deleteById = async (id: string): Promise<boolean> => {
  await DashboardModel.findOneAndDelete({ _id: id });
  logger.debug(`Dashboard with id ${id} has been removed`);
  return true;
};

const addElement = async (
  dashboardId: string,
  elementData: IDashboardElement,
): Promise<boolean> => {
  try {
    const newElement = await dashboardElementService.createDashboardElement(
      elementData,
    );
    if (!newElement.id) {
      throw new Error('Newly created element does not have an ID.');
    }
    await DashboardModel.findByIdAndUpdate(
      dashboardId,
      { $push: { elements: newElement.id } },
      { new: true },
    );
    logger.debug(`Element added to dashboard: %O`, newElement);
    return true;
  } catch (err) {
    logger.error(`Error adding element to dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error adding element to dashboard',
    );
  }
};

const deleteElement = async (
  dashboardId: string,
  elementId: string,
): Promise<boolean> => {
  try {
    await dashboardElementService.deleteDashboardElement(elementId);
    await DashboardModel.findByIdAndUpdate(
      dashboardId,
      { $pull: { elements: elementId } },
      { new: true },
    );
    logger.debug(`Element deleted from dashboard: ${elementId}`);
    return true;
  } catch (err) {
    logger.error(`Error deleting element from dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error deleting element from dashboard',
    );
  }
};

const updateElementInDashboard = async (
  dashboardId: string,
  elementData: IDashboardElement,
): Promise<boolean> => {
  try {
    await dashboardElementService.updateDashboardElement(elementData);
    // Assuming updateElement updates the element in its own collection
    logger.debug(`Element updated in dashboard: %O`, elementData);
    return true;
  } catch (err) {
    logger.error(`Error updating element in dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error updating element in dashboard',
    );
  }
};

export {
  create,
  read,
  getAll,
  update,
  deleteById,
  addElement,
  deleteElement,
  updateElementInDashboard,
};

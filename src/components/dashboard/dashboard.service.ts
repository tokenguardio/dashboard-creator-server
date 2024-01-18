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
  try {
    logger.debug('log id', id);
    logger.debug(`Fetching dashboard with id ${id}`);
    // Populate the elements field
    const dashboard = await DashboardModel.findOne({ _id: id }).populate(
      'elements',
    );
    if (!dashboard) {
      throw new Error(`Dashboard with id ${id} not found`);
    }
    return dashboard as IDashboard;
  } catch (error) {
    logger.error('Error in fetching dashboard:', error);
    throw error; // Rethrow the error for further handling
  }
};

const getAll = async (): Promise<IDashboard[]> => {
  logger.debug(`Fetching all dashboards`);
  const dashboards = await DashboardModel.find({});
  return dashboards as IDashboard[];
};

const update = async (dashboard: IWriteDashboard): Promise<boolean> => {
  console.log('log update', dashboard);
  const updatedDashboard = await DashboardModel.findOneAndUpdate(
    { id: dashboard.id },
    dashboard,
    { new: true },
  );
  logger.debug(`Dashboard updated: %O`, updatedDashboard);
  return true;
};

const deleteById = async (id: string): Promise<void> => {
  const dashboard = await DashboardModel.findOne({ _id: id });
  if (!dashboard) {
    throw new Error(`Dashboard with id ${id} does not exist.`);
  }

  await DashboardModel.findOneAndDelete({ _id: id });
  logger.debug(`Dashboard with id ${id} has been removed`);
};

const addElement = async (
  dashboardId: string,
  elementData: IDashboardElement,
): Promise<boolean> => {
  try {
    // Check if the dashboard exists
    const dashboard = await DashboardModel.findById(dashboardId);
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const newElement = await dashboardElementService.createDashboardElement(
      elementData,
    );

    await DashboardModel.findByIdAndUpdate(
      dashboardId,
      // eslint-disable-next-line no-underscore-dangle
      { $push: { elements: newElement._id } },
      { new: true },
    );

    logger.debug(`Element added to dashboard: %O`, newElement);
    return true;
  } catch (err) {
    logger.error(`Error adding element to dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error adding element to dashboard',
      err.message,
    );
  }
};

const deleteElement = async (
  dashboardId: string,
  elementId: string,
): Promise<boolean> => {
  try {
    // Check if the dashboard exists
    const dashboard = await DashboardModel.findById(dashboardId);
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    // Check if the element is part of the dashboard
    const elementExists = dashboard.elements.some(
      // eslint-disable-next-line no-underscore-dangle
      (element) => element._id.toString() === elementId,
    );
    if (!elementExists) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Element not found in dashboard',
      );
    }

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
      err.message,
    );
  }
};

const updateElementInDashboard = async (
  dashboardId: string,
  elementData: IDashboardElement,
): Promise<boolean> => {
  try {
    // Check if the dashboard exists
    const dashboard = await DashboardModel.findOne({ _id: dashboardId });
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    // Check if the element is part of the dashboard
    const elementExists = dashboard.elements.some(
      // eslint-disable-next-line no-underscore-dangle
      (element) => element._id.toString() === elementData._id,
    );
    if (!elementExists) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Element not found in dashboard',
      );
    }

    // Update the dashboard element
    await dashboardElementService.updateDashboardElement(elementData);
    // Assuming updateElement updates the element in its own collection
    logger.debug(`Element updated in dashboard: %O`, elementData);
    return true;
  } catch (err) {
    logger.error(`Error updating element in dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error updating element in dashboard',
      err.message,
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

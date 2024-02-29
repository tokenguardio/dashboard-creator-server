import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import { DashboardModel } from '@components/dashboard/dashboard.model';
import * as dashboardElementService from '@components/dashboard/dashboardElement/dashboardElement.service';
import * as dashboardFilterService from '@components/dashboard/dashboardFilter/dashboardFilter.service';
import {
  IDashboard,
  ILayoutItem,
  IWriteDashboard,
} from '@components/dashboard/dashboard.interface';
import { IDashboardElement } from '@components/dashboard/dashboardElement/dashboardElement.interface';
import { IDashboardFilter } from './dashboardFilter/dashboardFilter.interface';

const create = async (dashboardData: IWriteDashboard): Promise<IDashboard> => {
  logger.info(`creating dashboard with data ${JSON.stringify(dashboardData)}`);
  const newDashboard = await DashboardModel.create({
    elements: [],
    layout: [],
    filters: [],
    ...dashboardData,
  });
  logger.info(`Dashboard created: %O`, newDashboard);
  return newDashboard;
};

const read = async (id: string): Promise<IDashboard> => {
  try {
    logger.debug(`Fetching dashboard with id ${id}`);
    // Populate the elements field
    const dashboard = await DashboardModel.findOne({ _id: id })
      .populate('elements')
      .populate({
        path: 'filters',
        match: { type: { $ne: 'hidden' } }, // Exclude filters with type 'hidden'
      })
      .populate('theme');
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
  const dashboards = await DashboardModel.find({})
    .populate('elements')
    .populate({
      path: 'filters',
      match: { type: { $ne: 'hidden' } }, // Exclude filters with type 'hidden'
    })
    .populate('theme');
  return dashboards as IDashboard[];
};

const update = async (
  dashboardId: string,
  dashboard: IWriteDashboard,
): Promise<IDashboard> => {
  logger.debug('log dashboard', dashboard);
  const updatedDashboard = await DashboardModel.findOneAndUpdate(
    { _id: dashboardId },
    dashboard,
    { new: true },
  );
  logger.debug(`log updatedDashboard', ${updatedDashboard}`);

  if (!updatedDashboard) {
    throw new Error('Dashboard not found');
  }

  logger.debug(`Dashboard updated: %O`, updatedDashboard);
  return updatedDashboard;
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
): Promise<IDashboardElement> => {
  try {
    // Check if the dashboard exists
    const dashboard = await DashboardModel.findOne({ _id: dashboardId });
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const newElement = await dashboardElementService.createDashboardElement(
      elementData,
    );

    await DashboardModel.findByIdAndUpdate(
      dashboardId,
      { $push: { elements: newElement._id } },
      { new: true },
    );

    logger.debug(`Element added to dashboard: %O`, newElement);
    return newElement;
  } catch (err) {
    logger.error(`Error adding element to dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error adding element to dashboard',
      err.message,
    );
  }
};

const getElement = async (
  dashboardId: string,
  elementId: string,
): Promise<IDashboardElement> => {
  try {
    logger.info(`dashboardId: ${dashboardId} elementId: ${elementId}`);
    const dashboard = await DashboardModel.findById(dashboardId).populate(
      'elements',
    );
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    dashboard.elements.forEach((element) => {
      logger.debug(`log element, ${element.id}`);
    });
    const element = dashboard.elements.find(
      (elt) => elt.id.toString() === elementId,
    );

    if (!element) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Element not found in dashboard',
      );
    }

    logger.debug(`Element read from dashboard ${dashboardId}: ${element}`);
    return element;
  } catch (err) {
    logger.error(`Error retrieving element from dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error retrieving element from dashboard',
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
    const dashboard = await DashboardModel.findById(dashboardId).populate(
      'elements',
    );
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

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
  elementId: string,
  elementData: IDashboardElement,
): Promise<boolean> => {
  try {
    const dashboard = await DashboardModel.findOne({ _id: dashboardId });
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const elementExists = dashboard.elements.some(
      // eslint-disable-next-line no-underscore-dangle
      (element) => element._id === elementId,
    );
    if (!elementExists) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Element not found in dashboard',
      );
    }

    await dashboardElementService.updateDashboardElement(
      elementId,
      elementData,
    );
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

const addFilter = async (
  dashboardId: string,
  filterData: IDashboardFilter,
): Promise<IDashboardFilter> => {
  try {
    const dashboard = await DashboardModel.findById(dashboardId);
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const newFilter = await dashboardFilterService.createFilter(filterData);
    await DashboardModel.findByIdAndUpdate(
      dashboardId,
      { $push: { filters: newFilter._id } },
      { new: true },
    );

    logger.debug(`Filter added to dashboard: %O`, newFilter);

    return newFilter;
  } catch (err) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error adding filter to dashboard',
      err.message,
    );
  }
};

const getFilter = async (
  dashboardId: string,
  filterId: string,
): Promise<IDashboardFilter> => {
  try {
    const dashboard = await (
      await DashboardModel.findById(dashboardId)
    ).populate('filters');
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const filter = dashboard.filters.find((x) => x._id.toString() === filterId);
    if (!filter) {
      throw new AppError(httpStatus.NOT_FOUND, 'Filter not found in dashboard');
    }

    return filter;
  } catch (err) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error retrieving filter from dashboard',
      err.message,
    );
  }
};

const getFilterByName = async (
  dashboardId: string,
  filterName: string,
): Promise<IDashboardFilter> => {
  try {
    const dashboard = await DashboardModel.findById(dashboardId).populate(
      'filters',
    );
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const filter = dashboard.filters.find(
      (filterElement) => filterElement.name === filterName,
    );
    if (!filter) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Filter '${filterName}' not found in dashboard`,
      );
    }

    return filter;
  } catch (err) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error retrieving filter '${filterName}' from dashboard`,
      err.message,
    );
  }
};

const deleteFilter = async (
  dashboardId: string,
  filterId: string,
): Promise<boolean> => {
  try {
    const dashboard = await DashboardModel.findById(dashboardId);
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const filterExists = dashboard.filters.some(
      // eslint-disable-next-line no-underscore-dangle
      (filter) => filter._id.toString() === filterId,
    );
    if (!filterExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Filter not found in dashboard');
    }

    await dashboardFilterService.deleteFilter(filterId);

    await DashboardModel.findByIdAndUpdate(
      dashboardId,
      { $pull: { filters: filterId } },
      { new: true },
    );
    logger.debug(`Filter deleted from dashboard: ${filterId}`);
    return true;
  } catch (err) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error deleting filter from dashboard',
      err.message,
    );
  }
};

const updateFilter = async (
  dashboardId: string,
  filterId: string,
  filterData: any,
) => {
  try {
    const dashboard = await DashboardModel.findById(dashboardId);
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const filterExists = dashboard.filters.some(
      // eslint-disable-next-line no-underscore-dangle
      (filter) => filter._id.toString() === filterId,
    );
    if (!filterExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Filter not found in dashboard');
    }
    logger.info(`FilterData: ${JSON.stringify(filterData)}`);
    await dashboardFilterService.updateFilter(filterId, filterData);
    logger.debug(`Filter updated in dashboard: %O`, filterData);
    return true;
  } catch (err) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error updating filter in dashboard',
      err.message,
    );
  }
};

const getElementByQueryId = async (dashboardId: string, queryId: number) => {
  try {
    logger.info(
      `Searching in dashboardId: ${dashboardId} for queryId: ${queryId}`,
    );
    const dashboard = await DashboardModel.findById(dashboardId).populate({
      path: 'elements',
      match: { type: 'basicQuery', queryId }, // Ensure to match elements of type basicQuery and the specific queryId
    });

    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    // Since populate with match might return an empty array if no elements are found
    if (dashboard.elements.length === 0) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Element not found in dashboard',
      );
    }

    const element = dashboard.elements[0]; // Assuming match returns at least one element
    logger.debug(`Element read from dashboard ${dashboardId}: ${element}`);
    return element;
  } catch (err) {
    logger.error(`Error retrieving element from dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error retrieving element from dashboard',
      err.message,
    );
  }
};

const addLayoutItem = async (
  dashboardId: string,
  layoutItem: ILayoutItem,
): Promise<void> => {
  try {
    const dashboard = await DashboardModel.findOne({ _id: dashboardId });
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    dashboard.layout.push(layoutItem);
    await dashboard.save();

    logger.info(`Layout item added to dashboard: ${dashboardId}`);
  } catch (err) {
    logger.error(`Error adding layout item to dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error adding layout item to dashboard',
      err.message,
    );
  }
};

const getLayoutItems = async (dashboardId: string): Promise<ILayoutItem[]> => {
  try {
    const dashboard = await DashboardModel.findById(dashboardId);
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    logger.info(`Retrieved layout items from dashboard: ${dashboardId}`);
    return dashboard.layout;
  } catch (err) {
    logger.error(
      `Error retrieving layout items from dashboard: %O`,
      err.message,
    );
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error retrieving layout items from dashboard',
      err.message,
    );
  }
};

const updateLayoutItem = async (
  dashboardId: string,
  layoutItemId: string,
  layoutItemData: ILayoutItem,
): Promise<void> => {
  try {
    const dashboard = await DashboardModel.findOne({ _id: dashboardId });
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    const layoutItemIndex = dashboard.layout.findIndex(
      (item) => item.id === layoutItemId,
    );
    if (layoutItemIndex === -1) {
      throw new AppError(httpStatus.NOT_FOUND, 'Layout item not found');
    }

    dashboard.layout[layoutItemIndex] = layoutItemData;
    await dashboard.save();

    logger.info(`Layout item updated in dashboard: ${dashboardId}`);
  } catch (err) {
    logger.error(`Error updating layout item in dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error updating layout item in dashboard',
      err.message,
    );
  }
};

const deleteLayoutItem = async (
  dashboardId: string,
  layoutItemId: string,
): Promise<void> => {
  try {
    const dashboard = await DashboardModel.findOne({ _id: dashboardId });
    if (!dashboard) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard not found');
    }

    dashboard.layout = dashboard.layout.filter(
      (item) => item.id !== layoutItemId,
    );
    await dashboard.save();

    logger.info(`Layout item deleted from dashboard: ${dashboardId}`);
  } catch (err) {
    logger.error(`Error deleting layout item from dashboard: %O`, err.message);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error deleting layout item from dashboard',
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
  getElement,
  deleteElement,
  updateElementInDashboard,
  addFilter,
  getFilter,
  deleteFilter,
  updateFilter,
  getElementByQueryId,
  getFilterByName,
  addLayoutItem,
  getLayoutItems,
  updateLayoutItem,
  deleteLayoutItem,
};

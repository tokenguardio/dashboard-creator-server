import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import { DashboardElementModel } from '@components/dashboardElement/dashboard_element.model';
import { IDashboardElement } from '@components/dashboardElement/dashboard_element.interface';

const createDashboardElement = async (
  elementData: IDashboardElement,
): Promise<IDashboardElement> => {
  try {
    const newElement = await DashboardElementModel.create(elementData);
    logger.debug(`DashboardElement created: %O`, newElement);
    return newElement; // Return the created element
  } catch (err) {
    logger.error(`DashboardElement create error: %O`, err.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Dashboard element was not created!',
    );
  }
};

const getDashboardElement = async (id: string): Promise<IDashboardElement> => {
  logger.debug(`Fetching DashboardElement with id ${id}`);
  const element = await DashboardElementModel.findOne({ id });
  return element as IDashboardElement;
};

const updateDashboardElement = async (
  elementData: IDashboardElement,
): Promise<boolean> => {
  try {
    const updatedElement = await DashboardElementModel.findOneAndUpdate(
      { id: elementData.id },
      elementData,
      { new: true },
    );
    logger.debug(`DashboardElement updated: %O`, updatedElement);
    return true;
  } catch (err) {
    logger.error(`DashboardElement update error: %O`, err.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Dashboard element was not updated!',
    );
  }
};

const deleteDashboardElement = async (id: string): Promise<boolean> => {
  await DashboardElementModel.findOneAndDelete({ id });
  logger.debug(`DashboardElement with id ${id} has been removed`);
  return true;
};

export {
  createDashboardElement,
  getDashboardElement,
  updateDashboardElement,
  deleteDashboardElement,
};

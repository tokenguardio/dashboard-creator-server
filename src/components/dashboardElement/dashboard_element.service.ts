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

/* eslint-disable no-underscore-dangle */
const updateDashboardElement = async (
  elementData: IDashboardElement,
): Promise<boolean> => {
  try {
    // Validate elementData and its _id
    if (!elementData || !elementData._id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid element data or missing element ID',
      );
    }

    // Check if the element exists
    const existingElement = await DashboardElementModel.findById(
      elementData._id,
    );
    if (!existingElement) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard element not found');
    }

    // Update the element
    const updatedElement = await DashboardElementModel.findByIdAndUpdate(
      elementData._id,
      elementData,
      { new: true },
    );

    if (!updatedElement) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error updating the dashboard element',
      );
    }

    logger.debug(`DashboardElement updated: %O`, updatedElement);
    return true;
  } catch (err) {
    logger.error(`DashboardElement update error: %O`, err.message);
    // Rethrow the error as it is to preserve the error status and message
    throw err;
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

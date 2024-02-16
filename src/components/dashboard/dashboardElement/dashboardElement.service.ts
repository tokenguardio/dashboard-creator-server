import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import {
  DashboardElementModel,
  DashboardElementButtonModel,
  DashboardElementTextModel,
  DashboardElementBasicQueryModel,
  DashboardElementCustomQueryModel,
} from './dashboardElement.model';
import {
  IDashboardElement,
  IDashboardElementText,
  IDashboardElementButton,
  IDashboardElementBasicQuery,
  IDashboardElementCustomQuery,
} from './dashboardElement.interface';

const createDashboardElement = async (
  elementData: IDashboardElement
): Promise<IDashboardElement> => {
  try {
    let newElement: any;

    switch (elementData.type) {
      case 'button':
        newElement = await DashboardElementButtonModel.create(
          elementData as IDashboardElementButton
        );
        break;
      case 'text':
        newElement = await DashboardElementTextModel.create(
          elementData as IDashboardElementText
        );
        break;
      case 'basicQuery':
        newElement = await DashboardElementBasicQueryModel.create(
          elementData as IDashboardElementBasicQuery
        );
        break;
      case 'customQuery':
        newElement = await DashboardElementCustomQueryModel.create(
          elementData as IDashboardElementCustomQuery
        );
        break;
      default:
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid dashboard element type: ${elementData.type}`
        );
    }

    logger.debug(`DashboardElement created: %O`, newElement);
    return newElement;
  } catch (err) {
    logger.error(`DashboardElement create error: %O`, err.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Dashboard element was not created!'
    );
  }
};

const getDashboardElement = async (
  id: string
): Promise<IDashboardElement | null> => {
  logger.debug(`Fetching DashboardElement with id ${id}`);
  const element = await DashboardElementModel.findOne({id}).lean();

  if (!element) {
    return null;
  }

  switch (element.type) {
    case 'button':
      return element as IDashboardElementButton;
    case 'text':
      return element as IDashboardElementText;
    case 'basicQuery':
      return element as IDashboardElementBasicQuery;
    case 'customQuery':
      return element as IDashboardElementCustomQuery;
    default:
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected dashboard element type: ${element.type}`
      );
  }
};


const updateDashboardElement = async (
  elementId: string,
  elementData: IDashboardElement
): Promise<boolean> => {
  try {
    if (!elementData || !elementId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid element data or missing element ID'
      );
    }

    const existingElement = await DashboardElementModel.findById(elementId);
    if (!existingElement) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard element not found');
    }

    switch (elementData.type) {
      case 'button':
        await DashboardElementButtonModel.findByIdAndUpdate(
          elementId,
          elementData as IDashboardElementButton,
          { new: true }
        );
        break;
      case 'text':
        await DashboardElementTextModel.findByIdAndUpdate(
          elementId,
          elementData as IDashboardElementText,
          { new: true }
        );
        break;
      case 'basicQuery':
        await DashboardElementBasicQueryModel.findByIdAndUpdate(
          elementId,
          elementData as IDashboardElementBasicQuery,
          { new: true }
        );
        break;
      case 'customQuery':
        await DashboardElementCustomQueryModel.findByIdAndUpdate(
          elementId,
          elementData as IDashboardElementCustomQuery,
          { new: true }
        );
        break;
      default:
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid dashboard element type: ${elementData.type}`
        );
    }

    logger.debug(`DashboardElement updated`);
    return true;
  } catch (err) {
    logger.error(`DashboardElement update error: %O`, err.message);
    // Rethrow the error as it is to preserve the error status and message
    throw err;
  }
};

const deleteDashboardElement = async (elementId: string): Promise<boolean> => {
  await DashboardElementModel.findByIdAndDelete(elementId);
  logger.debug(`DashboardElement with id ${elementId} has been removed`);
  return true;
};

export {
  createDashboardElement,
  getDashboardElement,
  updateDashboardElement,
  deleteDashboardElement,
};

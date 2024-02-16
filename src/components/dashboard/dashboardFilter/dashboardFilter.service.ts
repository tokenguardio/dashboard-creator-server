// dashboardFilter.service.ts

import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import {
  DashboardFilterModel,
  DashboardFilterStaticModel,
  DashboardFilterDynamicModel,
  DashboardFilterDependentModel,
} from './dashboardFilter.model';
import {
  IDashboardFilter,
  IDashboardFilterStatic,
  IDashboardFilterDynamic,
  IDashboardFilterDependent,
} from './dashboardFilter.interface';

const createFilter = async (filterData: IDashboardFilter): Promise<IDashboardFilter> => {
  try {
    let newFilter: any;

    switch (filterData.type) {
      case 'static':
        newFilter = await DashboardFilterStaticModel.create(filterData as IDashboardFilterStatic);
        break;
      case 'dynamic':
        newFilter = await DashboardFilterDynamicModel.create(filterData as IDashboardFilterDynamic);
        break;
      case 'dependent':
        newFilter = await DashboardFilterDependentModel.create(filterData as IDashboardFilterDependent);
        break;
      default:
        throw new AppError(httpStatus.BAD_REQUEST, `Invalid dashboard filter type: ${filterData.type}`);
    }

    logger.debug(`DashboardFilter created: %O`, newFilter);
    return newFilter;
  } catch (err) {
    logger.error(`DashboardFilter create error: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Dashboard filter was not created!');
  }
};

const getFilter = async (filterId: string): Promise<IDashboardFilter | null> => {
  logger.debug(`Fetching DashboardFilter with id ${filterId}`);
  const filter = await DashboardFilterModel.findById(filterId).lean();

  if (!filter) {
    return null;
  }

  switch (filter.type) {
    case 'static':
      return filter as IDashboardFilterStatic;
    case 'dynamic':
      return filter as IDashboardFilterDynamic;
    case 'dependent':
      return filter as IDashboardFilterDependent;
    default:
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Unexpected dashboard filter type: ${filter.type}`);
  }
};

const updateFilter = async (filterId: string, filterData: IDashboardFilter): Promise<boolean> => {
  try {
    if (!filterData || !filterId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid filter data or missing filter ID');
    }

    const existingFilter = await DashboardFilterModel.findById(filterId);
    if (!existingFilter) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dashboard filter not found');
    }

    switch (filterData.type) {
      case 'static':
        await DashboardFilterStaticModel.findByIdAndUpdate(filterId, filterData as IDashboardFilterStatic, { new: true });
        break;
      case 'dynamic':
        await DashboardFilterDynamicModel.findByIdAndUpdate(filterId, filterData as IDashboardFilterDynamic, { new: true });
        break;
      case 'dependent':
        await DashboardFilterDependentModel.findByIdAndUpdate(filterId, filterData as IDashboardFilterDependent, { new: true });
        break;
      default:
        throw new AppError(httpStatus.BAD_REQUEST, `Invalid dashboard filter type: ${filterData.type}`);
    }

    logger.debug(`DashboardFilter updated`);
    return true;
  } catch (err) {
    logger.error(`DashboardFilter update error: %O`, err.message);
    throw err;
  }
};

const deleteFilter = async (filterId: string): Promise<boolean> => {
  await DashboardFilterModel.findByIdAndDelete(filterId);
  logger.debug(`DashboardFilter with id ${filterId} has been removed`);
  return true;
};

export { 
  createFilter,
  getFilter,
  updateFilter,
  deleteFilter
};

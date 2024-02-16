import { Request, Response } from 'express';
import axios from 'axios';
import logger from '@core/utils/logger';
import httpStatus from 'http-status';
import {
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
} from '@components/dashboard/dashboard.service';
import {
  IDashboard,
  IWriteDashboard,
} from '@components/dashboard/dashboard.interface';
import {
  IDashboardElement,
  IDashboardElementCustomQuery,
} from '@components/dashboard/dashboardElement/dashboardElement.interface';
import { IDashboardFilter } from '@components/dashboard/dashboardFilter/dashboardFilter.interface';
const { API_BASE_URL } = process.env;

const createDashboard = async (req: Request, res: Response) => {
  try {
    const dashboardData = req.body as IWriteDashboard;
    const createdDashboard = await create(dashboardData);

    res.status(httpStatus.CREATED).send({
      message: 'Dashboard Created',
      output: createdDashboard,
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const getAllDashboards = async (req: Request, res: Response) => {
  try {
    const dashboards = await getAll();
    res
      .status(httpStatus.OK)
      .send({ message: 'Dashboards Read', output: dashboards });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const readDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await read(req.params.id);
    res
      .status(httpStatus.OK)
      .send({ message: 'Dashboard Read', output: dashboard });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const updateDashboard = async (req: Request, res: Response) => {
  try {
    const dashboardId = req.params.id;
    const dashboardData = req.body as IWriteDashboard;

    const updatedDashboard = await update(dashboardId, dashboardData);

    if (!updatedDashboard) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: 'Dashboard not found' });
    }

    return res
      .status(httpStatus.OK)
      .send({ message: 'Dashboard Updated', output: updatedDashboard });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

const deleteDashboard = async (req: Request, res: Response) => {
  try {
    await deleteById(req.params.id);
    res.status(httpStatus.ACCEPTED).send({ message: 'Dashboard Removed' });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const addDashboardElement = async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const elementData = req.body as IDashboardElement;

    const newElement = await addElement(dashboardId, elementData);

    res.status(httpStatus.CREATED).send({
      message: 'Element Added to Dashboard',
      output: newElement,
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const getDashboardElement = async (req: Request, res: Response) => {
  try {
    const { dashboardId, elementId } = req.params;
    logger.info(`dashboardId: ${dashboardId} elementId: ${elementId}`);
    const element = await getElement(dashboardId, elementId);

    res
      .status(httpStatus.OK)
      .send({ message: 'Element read', output: element });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const deleteDashboardElement = async (req: Request, res: Response) => {
  try {
    const { dashboardId, elementId } = req.params;
    await deleteElement(dashboardId, elementId);
    res
      .status(httpStatus.ACCEPTED)
      .send({ message: 'Element Removed from Dashboard' });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const updateDashboardElement = async (req: Request, res: Response) => {
  try {
    const { dashboardId, elementId } = req.params;
    const elementData = req.body as IDashboardElement;

    await updateElementInDashboard(dashboardId, elementId, elementData);
    res.status(httpStatus.OK).send({ message: 'Dashboard Element Updated' });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const prepareQueryPayload = (
  dashboard: IDashboard,
  element: IDashboardElementCustomQuery,
  filterValues: object[],
) => {
  let queryPayload: any = {
    id: element.queryId, // Assuming queryId corresponds to the ID field in the payload
    parameters: {
      values: [],
      identifiers: [],
    },
  };

  // @ADAM KROL - to jest jakas implementacja z chata GPT
  // trzeba tu zamiast tego dodać logikę 'poniedziałków'
  const extractDateRange = (period: string) => {
    let min_date: string;
    let max_date: string;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    switch (period) {
      case 'last 30 days':
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        min_date = last30Days.toISOString().split('T')[0];
        max_date = currentDate.toISOString().split('T')[0];
        break;
      case 'last 90 days':
        const last90Days = new Date();
        last90Days.setDate(last90Days.getDate() - 90);
        min_date = last90Days.toISOString().split('T')[0];
        max_date = currentDate.toISOString().split('T')[0];
        break;
      case 'last year':
        min_date = `${currentYear - 1}-${currentMonth}-01`;
        max_date = `${
          currentYear - 1
        }-${currentMonth}-${currentDate.getDate()}`;
        break;
      case 'all':
        min_date = '1970-01-01';
        max_date = currentDate.toISOString().split('T')[0];
        break;
      default:
        min_date = '1970-01-01';
        max_date = currentDate.toISOString().split('T')[0];
        break;
    }

    return { min_date, max_date };
  };

  filterValues.forEach((filter: any) => {
    if (filter.name === 'period') {
      const { min_date, max_date } = extractDateRange(filter.value);
      queryPayload.parameters.values.push({
        name: 'min_date',
        value: min_date,
      });
      queryPayload.parameters.values.push({
        name: 'max_date',
        value: max_date,
      });
    } else {
      queryPayload.parameters.values.push({
        name: filter.name,
        value: filter.value,
      });
    }
  });

  return queryPayload;
};

// at some point it must be more universal to handle basic query types as well
const getDashboardElementData = async (req: Request, res: Response) => {
  try {
    const { dashboardId, elementId } = req.params;
    const filterValues = req.body.filters;

    const dashboard = await read(dashboardId);
    const element = (await getElement(
      dashboardId,
      elementId,
    )) as IDashboardElementCustomQuery;
    const queryPayload = prepareQueryPayload(dashboard, element, filterValues);
    const url = `${API_BASE_URL}/execute-query`;
    const response = await axios.post(url, queryPayload);

    res.status(httpStatus.OK).send({
      message: 'Dashboard Element Data Retrieved',
      output: response.data,
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const addDashboardFilter = async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const filterData = req.body as IDashboardFilter;

    const newFilter = await addFilter(dashboardId, filterData);

    res.status(httpStatus.CREATED).send({
      message: 'Filter Added to Dashboard',
      output: newFilter,
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const getDashboardFilter = async (req: Request, res: Response) => {
  try {
    const { dashboardId, filterId } = req.params;

    const filter = await getFilter(dashboardId, filterId);

    res.status(httpStatus.OK).json(filter);
  } catch (err) {
    console.error(`Error retrieving dashboard filter: ${err.message}`);
    res
      .status(err.status || httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

const deleteDashboardFilter = async (req: Request, res: Response) => {
  try {
    const { dashboardId, filterId } = req.params;
    await deleteFilter(dashboardId, filterId);
    res
      .status(httpStatus.ACCEPTED)
      .send({ message: 'Filter Removed from Dashboard' });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const updateDashboardFilter = async (req: Request, res: Response) => {
  try {
    const { dashboardId, filterId } = req.params;
    const filterData = req.body as IDashboardFilter;

    await updateFilter(dashboardId, filterId, filterData);
    res.status(httpStatus.OK).send({ message: 'Dashboard Filter Updated' });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const getDashboardFilterData = async (req: Request, res: Response) => {
  try {
    // const { dashboardId, filterId } = req.params;
    // const filterValues = req.body.filters;

    // const dashboard = await read(dashboardId);
    // const getFilter = (await getFilter(
    //   dashboardId,
    //   filterId,
    // )) as IDashboardFilter;
    // const queryPayload = prepareFilterQueryPayload(dashboard, filter, filterValues);
    // const url = `${API_BASE_URL}/execute-query`;
    // const response = await axios.post(url, queryPayload);

    res.status(httpStatus.OK).send({
      message: 'Dashboard Element Data Retrieved',
      // output: response.data,
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

export {
  createDashboard,
  readDashboard,
  updateDashboard,
  deleteDashboard,
  addDashboardElement,
  getDashboardElement,
  deleteDashboardElement,
  updateDashboardElement,
  getDashboardElementData,
  getAllDashboards,
  addDashboardFilter,
  getDashboardFilter,
  deleteDashboardFilter,
  updateDashboardFilter,
  getDashboardFilterData,
};

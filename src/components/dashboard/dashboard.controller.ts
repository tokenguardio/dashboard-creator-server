import { Request, Response } from 'express';
import axios from 'axios';
import logger from '@core/utils/logger';
import config from '@config/config';
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
  getFilterByName,
  deleteFilter,
  updateFilter,
  getElementByQueryId,
  addLayoutItem,
  getLayoutItems,
  updateLayoutItem,
  deleteLayoutItem,
} from '@components/dashboard/dashboard.service';
import {
  IDashboard,
  IWriteDashboard,
} from '@components/dashboard/dashboard.interface';
import {
  IDashboardElement,
  IDashboardElementCustomQuery,
} from '@components/dashboard/dashboardElement/dashboardElement.interface';
import {
  IDashboardFilterValue,
  IDashboardFilter,
  IDashboardFilterDependent,
  IDashboardFilterDynamic,
} from '@components/dashboard/dashboardFilter/dashboardFilter.interface';

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

const prepareFilterQueryPayload = (
  dashboard: IDashboard,
  filter: IDashboardFilterDynamic | IDashboardFilterDependent,
  filterValues: IDashboardFilterValue[],
): object => {
  const queryPayload: any = {
    id: filter.queryId,
    parameters: {
      values: [],
      identifiers: [],
    },
  };
  // Extracting filter names from the filter
  const filterNames = filter.params;
  const filteredFilterValues = filterValues.filter((filterValue) =>
    filterNames.includes(filterValue.name),
  );
  filteredFilterValues.forEach((filterValue: any) => {
    queryPayload.parameters.values.push({
      name: filterValue.name,
      value: filterValue.value,
    });
  });
  return queryPayload;
};

const readDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await read(req.params.id);
    dashboard.filters.forEach(async (dashboardFilter) => {
      if ('queryId' in dashboardFilter) {
        const dynamicFilter = dashboardFilter as
          | IDashboardFilterDynamic
          | IDashboardFilterDependent;
        const filterValues = [];
        if ('params' in dynamicFilter && dynamicFilter.params.length > 0) {
          dynamicFilter.params.forEach((param) => {
            filterValues.push({ name: param, value: [' '] });
          });
        }
        const queryPayload = prepareFilterQueryPayload(
          dashboard,
          dashboardFilter as
            | IDashboardFilterDynamic
            | IDashboardFilterDependent,
          filterValues,
        );
        logger.info(
          `getFilterData queryPayload: ${JSON.stringify(queryPayload)}`,
        );
        const url = `${config.dbApiUrl}/execute-query`;
        const response = await axios.post(url, queryPayload);
        const data = await response.data;
        logger.info(`getFilterData response: ${JSON.stringify(data)}`);
        // Update options field if necessary
        if (data && data.data && Array.isArray(data.data)) {
          // Update options field if necessary
          // eslint-disable-next-line no-param-reassign
          dashboardFilter.options = data.data.map((item: any) => ({
            label: item.value,
            value: item.value,
          }));
        }
      }
    });

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
    logger.debug(`elementData ${JSON.stringify(elementData)}`);
    logger.debug(`dashboardId ${dashboardId}`);

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
  filterValues: IDashboardFilterValue[],
) => {
  const queryPayload: any = {
    id: element.queryId,
    parameters: {
      values: [],
      identifiers: [],
    },
  };

  // Extracting filter names from the dashboard
  const dashboardFilterNames = dashboard.filters.map((filter) => filter.name);
  // Filtering filterValues array based on dashboard filter names
  const filteredFilterValues = filterValues.filter((filter) =>
    dashboardFilterNames.includes(filter.name),
  );

  const extractDateRange = (period: string) => {
    let minDate: string;
    let maxDate: string;

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const getMostRecentMonday = (date: Date) => {
      const dayOfWeek = date.getDay();
      const mostRecentMonday = new Date(date);
      mostRecentMonday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
      return mostRecentMonday;
    };

    const calculateMondaysBack = (weeks: number) => {
      const currentDate = new Date();
      const mostRecentMonday = getMostRecentMonday(currentDate);
      const pastDate = new Date(mostRecentMonday);
      pastDate.setDate(mostRecentMonday.getDate() - weeks * 7);
      return pastDate;
    };

    const calculateMondays = (days: number) => Math.ceil(days / 7) + 1;

    switch (period) {
      case 'last week':
        minDate = formatDate(calculateMondaysBack(1));
        maxDate = formatDate(new Date());
        break;
      case '2 weeks':
        minDate = formatDate(calculateMondaysBack(2));
        maxDate = formatDate(new Date());
        break;
      case 'previous week':
        minDate = formatDate(calculateMondaysBack(2));
        maxDate = formatDate(calculateMondaysBack(1));
        break;
      case 'last month':
        minDate = formatDate(calculateMondaysBack(calculateMondays(30)));
        maxDate = formatDate(new Date());
        break;
      case '3 months':
        minDate = formatDate(calculateMondaysBack(calculateMondays(90)));
        maxDate = formatDate(new Date());
        break;
      case '6 months':
        minDate = formatDate(calculateMondaysBack(calculateMondays(180)));
        maxDate = formatDate(new Date());
        break;
      case 'last year':
        minDate = formatDate(calculateMondaysBack(calculateMondays(365)));
        maxDate = formatDate(new Date());
        break;
      case 'all time':
        minDate = '1970-01-01';
        maxDate = formatDate(new Date());
        break;
      default:
        minDate = '1970-01-01';
        maxDate = formatDate(new Date());
    }

    return { minDate, maxDate };
  };

  // add default 'space' param for each missing (hidden) param
  dashboardFilterNames.forEach((filterName) => {
    if (!filteredFilterValues.some((filter) => filter.name === filterName)) {
      queryPayload.parameters.values.push({
        name: filterName,
        value: [' '],
      });
    }
  });

  filteredFilterValues.forEach((filter: any) => {
    if (filter.name === 'period') {
      const { minDate, maxDate } = extractDateRange(filter.value);
      queryPayload.parameters.values.push({
        name: 'min_date',
        value: minDate,
      });
      queryPayload.parameters.values.push({
        name: 'max_date',
        value: maxDate,
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
    const includeHiddenFilters = true;
    const dashboard = await read(dashboardId, includeHiddenFilters);
    const element = (await getElement(
      dashboardId,
      elementId,
    )) as IDashboardElementCustomQuery;
    const queryPayload = prepareQueryPayload(dashboard, element, filterValues);
    const url = `${config.dbApiUrl}/execute-query`;
    logger.info(
      `sending queryPayload: ${JSON.stringify(
        queryPayload,
      )} to ${url} with POST`,
    );
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
    logger.error(`Error retrieving dashboard filter: ${err.message}`);
    res
      .status(err.status || httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

const getDashboardFilterByName = async (req: Request, res: Response) => {
  try {
    const { dashboardId, filterName } = req.params;

    const filter = await getFilterByName(dashboardId, filterName);

    res.status(httpStatus.OK).json(filter);
  } catch (err) {
    logger.error(`Error retrieving dashboard filter by name: ${err.message}`);
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
    const { dashboardId, filterId } = req.params;
    const filterValues = req.body.params;

    const dashboard = await read(dashboardId);
    const filter = await getFilter(dashboardId, filterId);
    // Check if the filter object has the 'queryId' property
    if ('queryId' in filter) {
      const queryPayload = prepareFilterQueryPayload(
        dashboard,
        filter as IDashboardFilterDynamic | IDashboardFilterDependent,
        filterValues,
      );
      logger.info(
        `getFilterData queryPayload: ${JSON.stringify(queryPayload)}`,
      );
      const url = `${config.dbApiUrl}/execute-query`;
      const response = await axios.post(url, queryPayload);

      res.status(httpStatus.OK).send({
        message: 'Dashboard Filter Data Retrieved',
        output: response.data,
      });
    } else {
      throw new Error('Invalid filter type');
    }
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const getDashboardElementByQueryId = async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const { queryId } = req.body;

    logger.info(
      `Searching in dashboardId: ${dashboardId} for queryId: ${queryId}`,
    );

    const element = await getElementByQueryId(dashboardId, Number(queryId));

    if (!element) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: 'Element not found' });
    }

    return res
      .status(httpStatus.OK)
      .send({ message: 'Element Retrieved', output: element });
  } catch (err) {
    logger.error(`Error retrieving element: %O`, err);
    return res
      .status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

const addDashboardLayoutItem = async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const layoutItemData = req.body;

    await addLayoutItem(dashboardId, layoutItemData);

    res.status(httpStatus.CREATED).send({
      message: 'Layout Item Added to Dashboard',
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const getDashboardLayoutItems = async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;

    const layoutItems = await getLayoutItems(dashboardId);

    res.status(httpStatus.OK).send({
      message: 'Layout Items retrieved',
      output: layoutItems,
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const updateDashboardLayoutItem = async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const layoutItemId = req.body.id; // Assuming the client sends the layout item's ID in the body
    const layoutItemData = req.body; // The rest of the body is the layout item data

    await updateLayoutItem(dashboardId, layoutItemId, layoutItemData);

    res.status(httpStatus.OK).send({
      message: 'Layout Item Updated in Dashboard',
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
  }
};

const deleteDashboardLayoutItem = async (req: Request, res: Response) => {
  try {
    const { dashboardId, layoutItemId } = req.params;

    await deleteLayoutItem(dashboardId, layoutItemId);

    res.status(httpStatus.ACCEPTED).send({
      message: 'Layout Item Removed from Dashboard',
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
  getDashboardFilterByName,
  deleteDashboardFilter,
  updateDashboardFilter,
  getDashboardFilterData,
  getDashboardElementByQueryId,
  addDashboardLayoutItem,
  getDashboardLayoutItems,
  updateDashboardLayoutItem,
  deleteDashboardLayoutItem,
};

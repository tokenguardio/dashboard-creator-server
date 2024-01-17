import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  create,
  read,
  getAll,
  update,
  deleteById,
  addElement,
  deleteElement,
  updateElementInDashboard,
} from '@components/dashboard/dashboard.service';
import { IWriteDashboard } from '@components/dashboard/dashboard.interface';
import { IDashboardElement } from '@components/dashboardElement/dashboard_element.interface';

const createDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = req.body as IWriteDashboard;
    await create(dashboard);
    res.status(httpStatus.CREATED).send({ message: 'Dashboard Created' });
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

const updateDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = req.body as IWriteDashboard;
    await update(dashboard);
    res.status(httpStatus.OK).send({ message: 'Dashboard Updated' });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: err.message });
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
    const { dashboardId, elementData } = req.body as {
      dashboardId: string;
      elementData: IDashboardElement;
    };
    await addElement(dashboardId, elementData);
    res
      .status(httpStatus.CREATED)
      .send({ message: 'Element Added to Dashboard' });
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
    const { dashboardId, elementData } = req.body as {
      dashboardId: string;
      elementData: IDashboardElement;
    };
    await updateElementInDashboard(dashboardId, elementData);
    res.status(httpStatus.OK).send({ message: 'Dashboard Element Updated' });
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
  deleteDashboardElement,
  updateDashboardElement,
  getAllDashboards,
};

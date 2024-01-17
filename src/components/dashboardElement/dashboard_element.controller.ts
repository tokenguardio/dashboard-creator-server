import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  createDashboardElement,
  getDashboardElement,
  updateDashboardElement,
  deleteDashboardElement,
} from '@components/dashboardElement/dashboard_element.service';
import { IDashboardElement } from '@components/dashboardElement/dashboard_element.interface';

const createDashboardElementHandler = async (req: Request, res: Response) => {
  const elementData = req.body as IDashboardElement;
  await createDashboardElement(elementData);
  res.status(httpStatus.CREATED);
  return res.send({ message: 'Dashboard Element Created' });
};

const readDashboardElementHandler = async (req: Request, res: Response) => {
  const element = await getDashboardElement(req.params.id);
  res.status(httpStatus.OK);
  return res.send({ message: 'Dashboard Element Fetched', output: element });
};

const updateDashboardElementHandler = async (req: Request, res: Response) => {
  const elementData = req.body as IDashboardElement;
  await updateDashboardElement(elementData);
  res.status(httpStatus.OK);
  return res.send({ message: 'Dashboard Element Updated' });
};

const deleteDashboardElementHandler = async (req: Request, res: Response) => {
  await deleteDashboardElement(req.params.id);
  res.status(httpStatus.ACCEPTED);
  return res.send({ message: 'Dashboard Element Removed' });
};

export {
  createDashboardElementHandler,
  readDashboardElementHandler,
  updateDashboardElementHandler,
  deleteDashboardElementHandler,
};

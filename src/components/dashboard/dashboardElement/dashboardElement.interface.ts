export interface IDashboardElement {
  _id: string;
  id: string;
  title: string;
  type: 'button' | 'text' | 'basicQuery' | 'customQuery';
}

export interface IDashboardElementText extends IDashboardElement {
  type: 'text';
  text: string;
}

export interface IDashboardElementButton extends IDashboardElement {
  type: 'button';
  text: string;
  link: string;
}

export interface IDashboardElementVis extends IDashboardElement {
  visType:
    | 'areaChart'
    | 'barChart'
    | 'stackedBarChart'
    | 'multiAreaChart'
    | 'lineChart'
    | 'multiLineChart'
    | 'table'
    | 'singleValue'
    | 'pieChart';
}

export interface IDashboardElementBasicQuery extends IDashboardElementVis {
  type: 'basicQuery';
  dimension: string;
  differential?: string;
  measures: string[];
}

export interface IDashboardElementCustomQuery extends IDashboardElementVis {
  type: 'customQuery';
  queryId: number;
}

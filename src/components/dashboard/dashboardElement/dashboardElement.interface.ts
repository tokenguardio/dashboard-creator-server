export interface IDashboardElement {
  _id: string;
  id: string;
  title: string;
  type: 'button' | 'text' | 'basicQuery' | 'customQuery' | 'dappAnalytics';
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

export interface IDashboardElementBasicQueryMeasure {
  columnName: string;
  operator: string;
}

export interface IDashboardElementBasicQuery extends IDashboardElementVis {
  type: 'basicQuery';
  dbname: string;
  schema: string;
  table: string;
  dimension: string;
  differential?: string;
  measures: IDashboardElementBasicQueryMeasure[];
}

export interface IDashboardElementCustomQuery extends IDashboardElementVis {
  type: 'customQuery';
  queryId: number;
}

//********************* dapp analytics *********************//

export interface IDashboardElementDappAnalyticsFilterCondition {
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=';
  value: number | string | boolean;
}

export interface IDashboardElementDappAnalyticsFilterArg {
  type: 'integer' | 'string' | 'boolean';
  conditions: IDashboardElementDappAnalyticsFilterCondition[];
  value: string | boolean;
}

export interface IDashboardElementDappAnalyticsFilter {
  name: string;
  type: 'call' | 'event';
  args: Record<string, IDashboardElementDappAnalyticsFilterArg>;
}

export interface IDashboardElementDappAnalytics extends IDashboardElementVis {
  type: 'dappAnalytics';
  dappId: string;
  metric: 'wallets' | 'transferredTokens' | 'interactions';
  breakdown: boolean;
  filters: IDashboardElementDappAnalyticsFilter[];
}

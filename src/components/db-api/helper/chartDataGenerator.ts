export const createChartDataPayload = ({
  dimension,
  parsedMeasures,
  differential,
  parsedFilters,
}) => {
  const payload = {
    groupByColumns: [{ columnName: dimension }],
    aggregateColumns: parsedMeasures,
    filters: parsedFilters,
  };

  if (differential) {
    payload.groupByColumns.push({ columnName: differential });
  }

  return payload;
};

export const formatChartDataResponse = (
  data,
  { dimension, differential, parsedMeasures },
) => {
  return data.map((row) => {
    const newRow: {
      dimension?: string;
      differential?: string;
      measure?: any;
    } = {};

    newRow.dimension = row[dimension];
    if (differential) newRow.differential = row[differential];

    parsedMeasures.forEach((measure) => {
      newRow[measure.columnName] =
        row[`${measure.columnName}_${measure.operator}`];
    });

    return newRow;
  });
};

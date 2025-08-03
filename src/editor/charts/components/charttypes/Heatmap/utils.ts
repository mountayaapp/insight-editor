import type KeplerTable from "@kepler.gl/table";
import type { Field } from "@kepler.gl/types";
import type { HeatmapSeriesOption } from "echarts";

type generateHeatmapSeriesOptionsResult = {
	series: HeatmapSeriesOption[];
	min: number;
	max: number;
};

export const generateHeatmapSeriesOptions = (
	dataset: KeplerTable<Field>,
	fieldForX: Field | null,
	fieldForY: Field | null,
	fieldForAggregate: Field | null,
): generateHeatmapSeriesOptionsResult => {
	if (
		!fieldForX ||
		fieldForX.fieldIdx == null ||
		!fieldForY ||
		fieldForY.fieldIdx == null
	) {
		return {
			series: [],
			min: 0,
			max: 5,
		};
	}

	const aggregatedMap = new Map<string, number>();

	dataset.dataContainer.rows().forEach((row) => {
		const rowValues = row.values();
		const xValue = rowValues[fieldForX.fieldIdx];
		const yValue = rowValues[fieldForY.fieldIdx];

		let valueToAggregate: number = 1;

		if (fieldForAggregate && fieldForAggregate.fieldIdx != null) {
			const rawSumValue = rowValues[fieldForAggregate.fieldIdx];
			if (typeof rawSumValue === "number") {
				valueToAggregate = rawSumValue;
			} else {
				valueToAggregate = 1;
			}
		}

		if (
			xValue !== undefined &&
			xValue !== null &&
			yValue !== undefined &&
			yValue !== null
		) {
			const key = `${xValue}_${yValue}`;
			aggregatedMap.set(key, (aggregatedMap.get(key) || 0) + valueToAggregate);
		}
	});

	const singleSeriesData: [string | number, string | number, number][] = [];
	let minVal = Infinity;
	let maxVal = -Infinity;

	aggregatedMap.forEach((sumValue, key) => {
		const parts = key.split("_");
		const x = Number.isNaN(Number(parts[0])) ? parts[0] : Number(parts[0]);
		const y = Number.isNaN(Number(parts[1])) ? parts[1] : Number(parts[1]);

		singleSeriesData.push([x, y, sumValue]);

		minVal = Math.min(minVal, sumValue);
		maxVal = Math.max(maxVal, sumValue);
	});

	const seriesOptions: HeatmapSeriesOption[] = [
		{
			data: singleSeriesData,
			type: "heatmap",
		},
	];

	return {
		series: seriesOptions,
		min: minVal === Infinity ? 0 : minVal,
		max: maxVal === -Infinity ? (minVal === Infinity ? 5 : minVal + 5) : maxVal,
	};
};

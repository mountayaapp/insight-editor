import type KeplerTable from "@kepler.gl/table";
import type { Field } from "@kepler.gl/types";
import type { LineSeriesOption } from "echarts";

type generateLineSeriesOptionsResult = {
	series: LineSeriesOption[];
};

export const generateLineSeriesOptions = (
	dataset: KeplerTable<Field>,
	fieldForX: Field,
	fieldForY: Field,
	fieldForGroupBy: Field | null,
	categoriesForX: (string | number | Date)[],
): generateLineSeriesOptionsResult => {
	if (
		!fieldForX ||
		!fieldForY ||
		fieldForX.fieldIdx == null ||
		fieldForY.fieldIdx == null
	) {
		return {
			series: [],
		};
	}

	if (!fieldForGroupBy || fieldForGroupBy.fieldIdx == null) {
		const singleSeriesData = categoriesForX.map((xVal) => {
			const row = dataset.dataContainer
				.rows()
				.find((r) => r.values()[fieldForX.fieldIdx] === xVal);

			return row ? row.values()[fieldForY.fieldIdx] : null;
		});

		return {
			series: [
				{
					name: fieldForY.name,
					data: singleSeriesData,
					type: "line",
				},
			],
		};
	}

	const groupedData = new Map<unknown, Map<unknown, unknown>>();
	const groupNames = new Map<unknown, string>();

	dataset.dataContainer.rows().forEach((row) => {
		const rowValues = row.values();
		const groupKey = rowValues[fieldForGroupBy.fieldIdx];
		const valueForX = rowValues[fieldForX.fieldIdx];
		const valueForY = rowValues[fieldForY.fieldIdx];

		if (groupKey !== undefined && valueForX !== undefined && valueForY !== undefined) {
			if (!groupedData.has(groupKey)) {
				groupedData.set(groupKey, new Map<unknown, unknown>());
				groupNames.set(groupKey, String(groupKey));
			}

			groupedData.get(groupKey)?.set(valueForX, valueForY);
		}
	});

	const seriesArray = Array.from(groupedData.entries())
		.map<LineSeriesOption>(([groupKey, xYMap]) => {
			const data = categoriesForX.map((xVal) => xYMap.get(xVal) || null);
			return {
				name: groupNames.get(groupKey) || String(groupKey),
				data: data,
				type: "line",
			};
		})
		.sort((a, b) => (a.name as string).localeCompare(b.name as string));

	return {
		series: seriesArray,
	};
};

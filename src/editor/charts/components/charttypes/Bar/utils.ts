import type KeplerTable from "@kepler.gl/table";
import type { Field } from "@kepler.gl/types";
import type { BarSeriesOption } from "echarts";

type generateBarSeriesOptionsResult = {
	series: BarSeriesOption[];
};

export const generateBarSeriesOptions = (
	dataset: KeplerTable<Field>,
	fieldForX: Field,
	fieldForY: Field,
	fieldForGroupBy: Field | null,
	categoriesForX: (string | number | Date)[],
): generateBarSeriesOptionsResult => {
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

	const rows = dataset.dataContainer.rows();

	if (!fieldForGroupBy || fieldForGroupBy.fieldIdx == null) {
		const dataMap = new Map<unknown, unknown>();
		rows.forEach((row) => {
			const rowValues = row.values();
			dataMap.set(rowValues[fieldForX.fieldIdx], rowValues[fieldForY.fieldIdx]);
		});

		const singleSeriesData = categoriesForX.map(
			(valueForX) => dataMap.get(valueForX) ?? null,
		);

		return {
			series: [
				{
					name: fieldForY.name,
					data: singleSeriesData,
					type: "bar",
				},
			],
		};
	}

	const groupedData = new Map<unknown, Map<unknown, unknown>>();
	const groupNames = new Map<unknown, string>();

	rows.forEach((row) => {
		const rowValues = row.values();
		const groupKey = rowValues[fieldForGroupBy.fieldIdx];
		const valueForX = rowValues[fieldForX.fieldIdx];
		const valueForY = rowValues[fieldForY.fieldIdx];

		if (groupKey != null && valueForX != null && valueForY != null) {
			if (!groupedData.has(groupKey)) {
				groupedData.set(groupKey, new Map<unknown, unknown>());
				groupNames.set(groupKey, String(groupKey));
			}

			groupedData.get(groupKey)?.set(valueForX, valueForY);
		}
	});

	const seriesArray = Array.from(groupedData.entries())
		.map<BarSeriesOption>(([groupKey, mapXY]) => {
			const data = categoriesForX.map((xCategory) => mapXY.get(xCategory) ?? null);
			return {
				name: groupNames.get(groupKey) || String(groupKey),
				data: data,
				type: "bar",
			};
		})
		.sort((a, b) => (a.name as string).localeCompare(b.name as string));

	return {
		series: seriesArray,
	};
};

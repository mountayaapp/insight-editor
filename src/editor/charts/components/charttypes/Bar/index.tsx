import { FieldSelector, PanelLabel } from "@kepler.gl/components";
import { ALL_FIELD_TYPES } from "@kepler.gl/constants";
import { FormattedMessage } from "@kepler.gl/localization";
import type KeplerTable from "@kepler.gl/table";
import type { Field } from "@kepler.gl/types";
import type { BarSeriesOption, EChartsOption } from "echarts";
import Echart from "echarts-for-react";
import { useCallback, useMemo, useState } from "react";

import { generateBarSeriesOptions } from "./utils";
import type { Chart } from "../../../types";
import {
	findFieldSafely,
	formatAxisValue,
	generateSeries,
	getAvailableFields,
} from "../utils";

export type BarChartFields = {
	xAxis: {
		field: string;
	};
	yAxis: {
		field: string;
	};
	groupBy?: {
		field: string | null;
	};
};

type BarChartProps = {
	chart: Chart<BarChartFields>;
	dataset: KeplerTable<Field>;
	readonly: boolean;
	style: React.CSSProperties;

	// Only required and applied when "readonly" is false.
	onChartChange?: (chart: Chart<BarChartFields>) => void;
};

export const BarChart = (props: BarChartProps) => {
	const availableFieldsForX = useMemo(
		() =>
			getAvailableFields(props.dataset.fields, [
				ALL_FIELD_TYPES.integer,
				ALL_FIELD_TYPES.real,
				ALL_FIELD_TYPES.string,
				ALL_FIELD_TYPES.date,
				ALL_FIELD_TYPES.timestamp,
			]),
		[props.dataset.fields],
	);

	const availableFieldsForY = useMemo(
		() =>
			getAvailableFields(props.dataset.fields, [
				ALL_FIELD_TYPES.integer,
				ALL_FIELD_TYPES.real,
			]),
		[props.dataset.fields],
	);

	const availableFieldsForGroupBy = useMemo(
		() =>
			getAvailableFields(props.dataset.fields, [
				ALL_FIELD_TYPES.integer,
				ALL_FIELD_TYPES.real,
				ALL_FIELD_TYPES.string,
				ALL_FIELD_TYPES.boolean,
				ALL_FIELD_TYPES.date,
				ALL_FIELD_TYPES.timestamp,
			]),
		[props.dataset.fields],
	);

	const [fieldForX, setFieldForX] = useState<Field | null>(() => {
		if (props.chart.fields.xAxis) {
			return findFieldSafely(
				availableFieldsForX,
				(field) => field.name === props.chart.fields.xAxis.field,
			);
		}

		return findFieldSafely(
			availableFieldsForX,
			(field) =>
				field.type === ALL_FIELD_TYPES.timestamp || field.type === ALL_FIELD_TYPES.date,
		);
	});

	const [fieldForY, setFieldForY] = useState<Field | null>(() => {
		if (props.chart.fields.yAxis) {
			return findFieldSafely(
				availableFieldsForY,
				(field) => field.name === props.chart.fields.yAxis.field,
			);
		}

		return findFieldSafely(
			availableFieldsForY,
			(field) =>
				field.type === ALL_FIELD_TYPES.integer ||
				(field.type === ALL_FIELD_TYPES.real && !field.name.includes("id")),
		);
	});

	const [fieldForGroupBy, setFieldForGroupBy] = useState<Field | null>(() => {
		if (props.chart.fields.groupBy) {
			return findFieldSafely(
				availableFieldsForGroupBy,
				(field) => field.name === props.chart.fields.groupBy?.field,
			);
		}

		return null;
	});

	const [currentCategoriesForX, setCurrentCategoriesForX] = useState<(string | number)[]>(
		() => {
			return generateSeries(props.dataset.dataContainer, fieldForX);
		},
	);

	const [currentSeries, setCurrentSeries] = useState<BarSeriesOption[]>(() => {
		const initialDataForX = generateSeries(props.dataset.dataContainer, fieldForX);
		if (!fieldForX || !fieldForY) {
			return [];
		}

		const { series } = generateBarSeriesOptions(
			props.dataset,
			fieldForX,
			fieldForY,
			fieldForGroupBy,
			initialDataForX,
		);

		return series;
	});

	const updateChartDataAndNotifyParent = useCallback(
		(
			nextFieldForX: Field | null,
			nextFieldForY: Field | null,
			nextFieldForGroupBy: Field | null,
			dataset: KeplerTable<Field>,
		) => {
			let newCategoriesForX: (string | number)[] = [];
			let newSeries: BarSeriesOption[] = [];

			if (nextFieldForX && nextFieldForY) {
				newCategoriesForX = generateSeries(dataset.dataContainer, nextFieldForX);
				const { series } = generateBarSeriesOptions(
					dataset,
					nextFieldForX,
					nextFieldForY,
					nextFieldForGroupBy,
					newCategoriesForX,
				);

				newSeries = series;
			}

			setCurrentCategoriesForX(newCategoriesForX);
			setCurrentSeries(newSeries);

			if (props.onChartChange) {
				props.onChartChange({
					...props.chart,
					type: "bar",
					fields: {
						xAxis: {
							field: nextFieldForX?.name || "",
						},
						yAxis: {
							field: nextFieldForY?.name || "",
						},
						groupBy: {
							field: nextFieldForGroupBy?.name || null,
						},
					},
					settings: {
						xAxis: {
							type: "category",
							data: newCategoriesForX,
						},
						yAxis: {
							type: "value",
						},
						series: newSeries,
					},
				});
			}
		},
		[props.chart, props.onChartChange],
	);

	const handleChangeFieldForX = useCallback(
		(field: Field) => {
			setFieldForX(field);
			updateChartDataAndNotifyParent(field, fieldForY, fieldForGroupBy, props.dataset);
		},
		[fieldForY, fieldForGroupBy, props.dataset, updateChartDataAndNotifyParent],
	);

	const handleChangeFieldForY = useCallback(
		(field: Field) => {
			setFieldForY(field);
			updateChartDataAndNotifyParent(fieldForX, field, fieldForGroupBy, props.dataset);
		},
		[fieldForX, fieldForGroupBy, props.dataset, updateChartDataAndNotifyParent],
	);

	const handleChangeFieldForGroupBy = useCallback(
		(field: Field | null) => {
			setFieldForGroupBy(field);
			updateChartDataAndNotifyParent(fieldForX, fieldForY, field, props.dataset);
		},
		[fieldForX, fieldForY, props.dataset, updateChartDataAndNotifyParent],
	);

	const echartsOption: EChartsOption = useMemo(() => {
		if (!fieldForX || !fieldForY) {
			return {
				xAxis: {
					type: "category",
					data: [],
				},
				yAxis: {
					type: "value",
				},
				series: [],
				legend: {},
			};
		}

		return {
			xAxis: {
				type: "category",
				data: currentCategoriesForX,
				axisLabel: {
					formatter: (value: string | number) =>
						formatAxisValue(props.dataset, fieldForX, value),
				},
			},
			yAxis: {
				type: "value",
				axisLabel: {
					formatter: (value: string | number) =>
						formatAxisValue(props.dataset, fieldForY, value),
				},
			},
			legend: {
				type: "scroll",
				bottom: 0,
			},
			series: currentSeries.map((serie) => {
				return {
					...serie,
					emphasis: {
						focus: "series",
					},
				};
			}),
			tooltip: {
				trigger: "axis",
				axisPointer: {
					type: "shadow",
				},
			},
		};
	}, [fieldForX, fieldForY, currentCategoriesForX, currentSeries, props.dataset]);

	return (
		<>
			{!props.readonly ? (
				<div className="field-list">
					<div className="field-selector">
						<PanelLabel inputMode="search" aria-required>
							<FormattedMessage id="charts.editor.form.x.label" /> *
						</PanelLabel>
						<FieldSelector
							inputTheme="light"
							fields={availableFieldsForX}
							value={fieldForX}
							onSelect={handleChangeFieldForX}
							erasable={false}
						/>
					</div>

					<div className="field-selector">
						<PanelLabel inputMode="search" aria-required>
							<FormattedMessage id="charts.editor.form.y.label" /> *
						</PanelLabel>
						<FieldSelector
							inputTheme="light"
							fields={availableFieldsForY}
							value={fieldForY}
							onSelect={handleChangeFieldForY}
							erasable={false}
						/>
					</div>

					<div className="field-selector">
						<PanelLabel inputMode="search">
							<FormattedMessage id="charts.editor.form.groupby.label" />
						</PanelLabel>
						<FieldSelector
							inputTheme="light"
							fields={availableFieldsForGroupBy}
							value={fieldForGroupBy}
							onSelect={handleChangeFieldForGroupBy}
							erasable={true}
						/>
					</div>
				</div>
			) : null}

			{fieldForX && fieldForY ? (
				<Echart option={echartsOption} style={props.style} />
			) : (
				<div className="errorstate">
					<FormattedMessage id="charts.editor.state.invalid-axis" />
				</div>
			)}
		</>
	);
};

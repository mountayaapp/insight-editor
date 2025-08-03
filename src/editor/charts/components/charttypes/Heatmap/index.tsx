import { FieldSelector, ItemSelector, PanelLabel } from "@kepler.gl/components";
import { ALL_FIELD_TYPES } from "@kepler.gl/constants";
import { FormattedMessage } from "@kepler.gl/localization";
import type KeplerTable from "@kepler.gl/table";
import type { Field } from "@kepler.gl/types";
import type { EChartsOption, HeatmapSeriesOption } from "echarts";
import Echart from "echarts-for-react";
import { useCallback, useMemo, useState } from "react";

import { generateHeatmapSeriesOptions } from "./utils";
import type { Aggregate, Chart } from "../../../types";
import {
	findFieldSafely,
	formatAxisValue,
	generateSeries,
	getAvailableFields,
} from "../utils";

export type HeatmapChartFields = {
	xAxis: {
		field: string;
	};
	yAxis: {
		field: string;
	};
	aggregate: {
		method: "count" | "sum";
		field: string | null;
	};
};

type HeatmapChartProps = {
	chart: Chart<HeatmapChartFields>;
	dataset: KeplerTable<Field>;
	readonly: boolean;
	style: React.CSSProperties;

	// Only required and applied when "readonly" is false.
	onChartChange?: (chart: Chart<HeatmapChartFields>) => void;
};

export const HeatmapChart = (props: HeatmapChartProps) => {
	const availableFieldsForX = useMemo(
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

	const availableFieldsForY = useMemo(
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

	const availableFieldsForAggregate = useMemo(
		() =>
			getAvailableFields(props.dataset.fields, [
				ALL_FIELD_TYPES.integer,
				ALL_FIELD_TYPES.real,
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
			(field) => field.type === ALL_FIELD_TYPES.string,
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
			(field) => field.type === ALL_FIELD_TYPES.string,
		);
	});

	const [aggregate, setAggregate] = useState<Aggregate>("count");

	const [fieldForAggregate, setFieldForAggregate] = useState<Field | null>(() => {
		if (props.chart.fields.aggregate?.field) {
			return findFieldSafely(
				availableFieldsForAggregate,
				(field) => field.name === props.chart.fields.aggregate.field,
			);
		}

		return findFieldSafely(
			availableFieldsForAggregate,
			(field) => field.type === ALL_FIELD_TYPES.integer,
		);
	});

	const [currentDataForX, setCurrentDataForX] = useState<(string | number)[]>(() =>
		generateSeries(props.dataset.dataContainer, fieldForX),
	);

	const [currentDataForY, setCurrentDataForY] = useState<(string | number)[]>(() =>
		generateSeries(props.dataset.dataContainer, fieldForY),
	);

	const [currentSeries, setCurrentSeries] = useState<HeatmapSeriesOption[]>(() => {
		const { series } = generateHeatmapSeriesOptions(
			props.dataset,
			fieldForX,
			fieldForY,
			fieldForAggregate,
		);

		return series;
	});

	const [minHeatmapValue, setMinHeatmapValue] = useState<number>(() => {
		const { min } = generateHeatmapSeriesOptions(
			props.dataset,
			fieldForX,
			fieldForY,
			fieldForAggregate,
		);

		return min;
	});

	const [maxHeatmapValue, setMaxHeatmapValue] = useState<number>(() => {
		const { max } = generateHeatmapSeriesOptions(
			props.dataset,
			fieldForX,
			fieldForY,
			fieldForAggregate,
		);

		return max;
	});

	const updateChartDataAndNotifyParent = useCallback(
		(
			nextFieldForX: Field | null,
			nextFieldForY: Field | null,
			nextFieldForAggregate: Field | null,
			dataset: KeplerTable<Field>,
		) => {
			const newDataForX = generateSeries(dataset.dataContainer, nextFieldForX);
			const newDataForY = generateSeries(dataset.dataContainer, nextFieldForY);

			let newSeries: HeatmapSeriesOption[] = [];
			let newMin: number = 0;
			let newMax: number = 0;

			if (nextFieldForX && nextFieldForY) {
				const { series, min, max } = generateHeatmapSeriesOptions(
					dataset,
					nextFieldForX,
					nextFieldForY,
					nextFieldForAggregate,
				);

				newSeries = series;
				newMin = min;
				newMax = max;
			}

			setCurrentDataForX(newDataForX);
			setCurrentDataForY(newDataForY);
			setCurrentSeries(newSeries);
			setMinHeatmapValue(newMin);
			setMaxHeatmapValue(newMax);

			const chartFields: HeatmapChartFields = {
				xAxis: {
					field: nextFieldForX?.name || "",
				},
				yAxis: {
					field: nextFieldForY?.name || "",
				},
				aggregate: {
					method: nextFieldForAggregate ? "sum" : "count",
					field: nextFieldForAggregate ? nextFieldForAggregate.name : null,
				},
			};

			if (props.onChartChange) {
				props.onChartChange({
					...props.chart,
					type: "heatmap",
					fields: chartFields,
					settings: {
						xAxis: {
							type: "category",
							data: newDataForX,
						},
						yAxis: {
							type: "category",
							data: newDataForY,
						},
						series: newSeries,
					},
				});
			}
		},
		[props.chart, props.onChartChange],
	);

	const handleChangeFieldX = useCallback(
		(field: Field) => {
			setFieldForX(field);
			updateChartDataAndNotifyParent(field, fieldForY, fieldForAggregate, props.dataset);
		},
		[fieldForY, fieldForAggregate, props.dataset, updateChartDataAndNotifyParent],
	);

	const handleChangeFieldY = useCallback(
		(field: Field) => {
			setFieldForY(field);
			updateChartDataAndNotifyParent(fieldForX, field, fieldForAggregate, props.dataset);
		},
		[fieldForX, fieldForAggregate, props.dataset, updateChartDataAndNotifyParent],
	);

	const handleChangeAggregate = useCallback(
		(item: Aggregate) => {
			setAggregate(item);

			if (item === "count") {
				setFieldForAggregate(null);
				updateChartDataAndNotifyParent(fieldForX, fieldForY, null, props.dataset);
			}
		},
		[fieldForX, fieldForY, props.dataset, updateChartDataAndNotifyParent],
	);

	const handleChangeFieldForAggregate = useCallback(
		(field: Field | null) => {
			setFieldForAggregate(field);
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
					type: "category",
					data: [],
				},
				series: [],
				legend: {},
				visualMap: {},
			};
		}

		return {
			xAxis: {
				type: "category",
				data: currentDataForX,
				splitArea: {
					show: true,
				},
				axisLabel: {
					formatter: (value: string | number) =>
						formatAxisValue(props.dataset, fieldForX, value),
				},
			},
			yAxis: {
				type: "category",
				data: currentDataForY,
				splitArea: {
					show: true,
				},
				axisLabel: {
					formatter: (value: string | number) =>
						formatAxisValue(props.dataset, fieldForY, value),
				},
			},
			legend: {
				show: false,
			},
			tooltip: {
				position: "top",
			},
			visualMap: {
				min: minHeatmapValue,
				max: maxHeatmapValue,
				calculable: true,
				orient: "horizontal",
				left: "center",
				formatter: (value) => {
					if (typeof value !== "number") {
						return String(value);
					}

					const formatField =
						fieldForAggregate || ({ type: "real", name: "Value" } as Field);

					return formatAxisValue(props.dataset, formatField, value);
				},
			},
			series: currentSeries.map((serie) => {
				return {
					...serie,
					name: `${fieldForX.name} / ${fieldForY.name}`,
					label: {
						show: true,
						position: "inside",
					},
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowColor: "rgba(0, 0, 0, 0.5)",
						},
					},
				};
			}),
		};
	}, [
		fieldForX,
		fieldForY,
		fieldForAggregate,
		currentDataForX,
		currentDataForY,
		currentSeries,
		minHeatmapValue,
		maxHeatmapValue,
		props.dataset,
	]);

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
							onSelect={handleChangeFieldX}
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
							onSelect={handleChangeFieldY}
							erasable={false}
						/>
					</div>

					<div className="field-selector">
						<PanelLabel aria-required>
							<FormattedMessage id="charts.editor.form.aggregate.label" /> *
						</PanelLabel>
						<ItemSelector
							inputTheme="light"
							options={["count", "sum"]}
							selectedItems={aggregate}
							onChange={(item) => handleChangeAggregate(item as Aggregate)}
							erasable={false}
							searchable={false}
							multiSelect={false}
						/>
					</div>

					<div className="field-selector">
						<PanelLabel inputMode="search">
							<FormattedMessage id={`charts.editor.form.aggregate-${aggregate}.label`} />
						</PanelLabel>
						<FieldSelector
							inputTheme="light"
							fields={availableFieldsForAggregate}
							value={aggregate === "count" ? null : fieldForAggregate}
							onSelect={handleChangeFieldForAggregate}
							erasable={true}
							disabled={aggregate === "count"}
							placeholder={
								aggregate === "count"
									? "charts.editor.form.aggregate-count.placeholder"
									: undefined
							}
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

import { generateHashId } from "@kepler.gl/common-utils";
import { Checkbox, PanelLabel } from "@kepler.gl/components";
import { FormattedMessage } from "@kepler.gl/localization";
import type React from "react";
import { useCallback, useState } from "react";

import { SVG as BarSVG } from "./charttypes/Bar/assets";
import { SVG as HeatmapSVG } from "./charttypes/Heatmap/assets";
import { SVG as LineSVG } from "./charttypes/Line/assets";
import type { SVGProps } from "./charttypes/types";
import type { Chart, ChartType } from "../types";

type ChartButton = {
	id: ChartType;
	svg: (props: SVGProps) => JSX.Element;
};

const chartButtons: ChartButton[] = [
	{
		id: "line",
		svg: LineSVG,
	},
	{
		id: "bar",
		svg: BarSVG,
	},
	{
		id: "heatmap",
		svg: HeatmapSVG,
	},
];

type ChartTypeSelectorProps = {
	chart?: Chart<unknown>;
	readonly: boolean;
	onMapToggleLayer: (chartId: string) => void;
};

export const ChartTypeSelector = (props: ChartTypeSelectorProps) => {
	const [activeChartType, setActiveChartType] = useState<ChartType>(
		props.chart?.type || "line",
	);

	const handleOnChartTypeChange = useCallback(
		(chartButton: ChartButton, event: React.ChangeEvent<HTMLInputElement>) => {
			event.preventDefault();

			setActiveChartType(chartButton.id);
			props.onMapToggleLayer(chartButton.id);
		},
		[props.onMapToggleLayer],
	);

	return (
		<>
			<PanelLabel inputMode="text" aria-required>
				<FormattedMessage id="charts.editor.form.charttype.label" /> *
			</PanelLabel>
			<div className="charttype-selector">
				{chartButtons.map((chartButton) => (
					<div key={chartButton.id} className="charttype-selector__item">
						<Checkbox
							id={`${chartButton.id}-toggle-${generateHashId(4)}`}
							type="radio"
							secondary={true}
							checked={activeChartType === chartButton.id}
							disabled={props.readonly}
							onChange={(event) => handleOnChartTypeChange(chartButton, event)}
							label={
								<>
									<div
										className={`charttype-selector__item__icon ${activeChartType === chartButton.id ? "active" : ""}`}
									>
										<chartButton.svg isActive={activeChartType === chartButton.id} />
									</div>
									<FormattedMessage
										id={`charts.editor.form.charttype.option.${chartButton.id}.label`}
									/>
								</>
							}
						/>
					</div>
				))}
			</div>
		</>
	);
};

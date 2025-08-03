import { MapControlButton, MapControlTooltipFactory } from "@kepler.gl/components";
import { Histogram } from "@kepler.gl/components/dist/common/icons";
import type { MapControls } from "@kepler.gl/types";
import type React from "react";
import { useCallback } from "react";

type ChartsPanelControlProps = {
	mapControls: MapControls & {
		chartsPanel: {
			show: boolean;
			active: boolean;
		};
	};
	onToggleMapControl: (control: string) => void;
};

const ChartsPanelControlFactory = (
	MapControlTooltip: ReturnType<typeof MapControlTooltipFactory>,
): React.FC<ChartsPanelControlProps> => {
	const ChartsPanelControl = (props: ChartsPanelControlProps) => {
		const handleOnClick = useCallback(
			(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
				event.preventDefault();
				props.onToggleMapControl("chartsPanel");
			},
			[props.onToggleMapControl],
		);

		const showControl = props.mapControls.chartsPanel?.show ?? false;
		if (!showControl) {
			return null;
		}

		const active = props.mapControls.chartsPanel?.active ?? false;
		return (
			<MapControlTooltip
				id="show-charts-panel"
				message={active ? "charts.panel.hide" : "charts.panel.show"}
			>
				<MapControlButton
					className="map-control-button toggle-charts-panel"
					onClick={handleOnClick}
					active={active}
				>
					<Histogram height="22px" />
				</MapControlButton>
			</MapControlTooltip>
		);
	};

	return ChartsPanelControl;
};

ChartsPanelControlFactory.deps = [MapControlTooltipFactory];

export default ChartsPanelControlFactory;

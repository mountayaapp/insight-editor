import {
	type LayerSelectorPanelFactory,
	type LocalePanelFactory,
	MapControlFactory,
	type MapControlProps,
	type MapDrawPanelFactory,
	type MapLegendPanelFactory,
	type SplitMapButtonFactory,
	type Toggle3dButtonFactory,
} from "@kepler.gl/components";
import type React from "react";

import SqlPanelControlFactory from "./SqlPanelControlFactory";

type CustomMapControlProps = MapControlProps & {
	defaultActionComponents: MapControlProps["actionComponents"];
};

const CustomMapControlFactory = (
	SqlPanelControl: ReturnType<typeof SqlPanelControlFactory>,
	SplitMapButton: ReturnType<typeof SplitMapButtonFactory>,
	Toggle3dButton: ReturnType<typeof Toggle3dButtonFactory>,
	LayerSelectorPanel: ReturnType<typeof LayerSelectorPanelFactory>,
	MapLegendPanel: ReturnType<typeof MapLegendPanelFactory>,
	MapDrawPanel: ReturnType<typeof MapDrawPanelFactory>,
	LocalePanel: ReturnType<typeof LocalePanelFactory>,
): React.FC<CustomMapControlProps> => {
	const MapControl = MapControlFactory(
		SplitMapButton,
		Toggle3dButton,
		LayerSelectorPanel,
		MapLegendPanel,
		MapDrawPanel,
		LocalePanel,
	);
	const actionComponents = [
		...(MapControl.defaultActionComponents ?? []),
		SqlPanelControl,
	];

	const CustomMapControl = (props: CustomMapControlProps) => {
		return (
			<div className="map-control-overlay">
				<div className="map-control-panel">
					<MapControl {...props} actionComponents={actionComponents} />
				</div>
			</div>
		);
	};

	return CustomMapControl;
};

CustomMapControlFactory.deps = [SqlPanelControlFactory, ...MapControlFactory.deps];

export default CustomMapControlFactory;

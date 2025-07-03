import { MapControlButton, MapControlTooltipFactory } from "@kepler.gl/components";
import { Db } from "@kepler.gl/components/dist/common/icons";
import type { MapControls } from "@kepler.gl/types";
import type React from "react";
import { useCallback } from "react";

type SqlPanelControlProps = {
	mapControls: MapControls & {
		sqlPanel: {
			show: boolean;
			active: boolean;
		};
	};
	onToggleMapControl: (control: string) => void;
};

const SqlPanelControlFactory = (
	MapControlTooltip: ReturnType<typeof MapControlTooltipFactory>,
): React.FC<SqlPanelControlProps> => {
	const SqlPanelControl = ({ mapControls, onToggleMapControl }: SqlPanelControlProps) => {
		const onClick = useCallback(
			(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
				event.preventDefault();
				onToggleMapControl("sqlPanel");
			},
			[onToggleMapControl],
		);

		const showControl = mapControls?.sqlPanel?.show;
		if (!showControl) {
			return null;
		}

		const active = mapControls?.sqlPanel?.active;
		return (
			<MapControlTooltip
				id="show-sql-panel"
				message={active ? "tooltip.hideSQLPanel" : "tooltip.showSQLPanel"}
			>
				<MapControlButton
					className="map-control-button toggle-sql-panel"
					onClick={onClick}
					active={active}
				>
					<Db height="18px" />
				</MapControlButton>
			</MapControlTooltip>
		);
	};

	return SqlPanelControl;
};

SqlPanelControlFactory.deps = [MapControlTooltipFactory];

export default SqlPanelControlFactory;

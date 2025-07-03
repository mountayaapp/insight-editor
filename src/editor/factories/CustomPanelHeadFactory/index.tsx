import {
	type CloudStorageDropdownFactory,
	PanelHeaderFactory,
	type PanelHeaderProps,
	type SaveExportDropdownFactory,
} from "@kepler.gl/components";
import type React from "react";

import CustomLogo from "./CustomLogo";

const CustomPanelHeaderFactory = (
	SaveExportDropdown: ReturnType<typeof SaveExportDropdownFactory>,
	CloudStorageDropdown: ReturnType<typeof CloudStorageDropdownFactory>,
): React.ComponentType<PanelHeaderProps> => {
	const OriginalPanelHeader = PanelHeaderFactory(
		SaveExportDropdown,
		CloudStorageDropdown,
	);

	const WrappedPanelHeader = (props: PanelHeaderProps) => {
		return <OriginalPanelHeader {...props} logoComponent={CustomLogo} />;
	};

	return WrappedPanelHeader;
};

CustomPanelHeaderFactory.deps = PanelHeaderFactory.deps;

export default CustomPanelHeaderFactory;

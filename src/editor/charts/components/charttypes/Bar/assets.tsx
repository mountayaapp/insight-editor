import { useMemo } from "react";

import type { SVGProps } from "../types";

// Source of the SVG: https://tabler.io/icons/icon/chart-bar
export const SVG = (props: SVGProps) => {
	const color = useMemo(() => {
		return props.isActive ? "#1FBAD6" : undefined;
	}, [props.isActive]);

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<title>Bar Chart</title>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path
				stroke={color}
				d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
			/>
			<path
				stroke={color}
				d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
			/>
			<path
				stroke={color}
				d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
			/>
			<path stroke={color} d="M4 20h14" />
		</svg>
	);
};

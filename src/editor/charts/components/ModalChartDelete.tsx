import { Modal } from "@kepler.gl/components";
import { FormattedMessage } from "@kepler.gl/localization";
import { useMemo } from "react";

import type { Chart } from "../types";

type ModalChartDeleteProps = {
	chart: Chart<unknown>;
	isModalOpen: boolean;
	onChartDelete: (chart: Chart<unknown>) => void;
	onModalClose: () => void;
};

export const ModalChartDelete = (props: ModalChartDeleteProps) => {
	const confirmButton = useMemo(
		() => ({
			large: true,
			negative: true,
			children: "charts.delete.button.delete",
		}),
		[],
	);

	const cancelButton = useMemo(
		() => ({
			large: true,
			children: "charts.delete.button.cancel",
		}),
		[],
	);

	return (
		<Modal
			title="charts.delete.modal.title"
			isOpen={props.isModalOpen}
			footer={true}
			cancelButton={cancelButton}
			onCancel={props.onModalClose}
			confirmButton={confirmButton}
			onConfirm={() => {
				props.onChartDelete(props.chart);
			}}
			cssStyle={`width: 40%; padding: 40px 40px 32px 40px;`}
			portalClassName="chart-delete"
		>
			<p>
				<FormattedMessage
					id="charts.delete.modal.warning"
					values={{
						chartTitle: props.chart.title,
					}}
				/>
			</p>
		</Modal>
	);
};

import type KeplerTable from "@kepler.gl/table";
import type { Field } from "@kepler.gl/types";
import { datetimeFormatter, getColumnFormatter } from "@kepler.gl/utils";

export const getAvailableFields = (fields: Field[], allowedTypes: string[]): Field[] => {
	const allowedTypeStrings = allowedTypes.map((type) => type.toString());
	return fields.filter((field) => allowedTypeStrings.includes(field.type));
};

export const findFieldSafely = (
	fieldsArray: Field[],
	predicate: (field: Field) => boolean,
): Field | null => {
	return fieldsArray.find(predicate) ?? null;
};

export const formatAxisValue = (
	dataset: KeplerTable<Field>,
	field: Field,
	value: string | number,
): string => {
	if (["date", "timestamp"].includes(field.type)) {
		const formatter = datetimeFormatter();
		return formatter(dataset.getColumnDisplayFormat(field.name))(Number(value));
	}

	const formatter = getColumnFormatter(field);
	return formatter(value);
};

export const generateSeries = (
	dataContainer: KeplerTable<Field>["dataContainer"],
	field: Field | null,
): (string | number)[] => {
	if (!field || field.fieldIdx == null) {
		return [];
	}

	const mappedData = dataContainer.map((row) => row.values()[field.fieldIdx]);

	const uniqueSortedData = [...new Set(mappedData)]
		.filter((value): value is string | number => value !== null && value !== undefined)
		.sort((a, b) => {
			if (typeof a === "number" && typeof b === "number") {
				return a - b;
			}

			if (typeof a === "string" && typeof b === "string") {
				return a.localeCompare(b);
			}

			return 0;
		});

	return uniqueSortedData;
};

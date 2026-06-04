import { activityNumberFields } from "./activityFormConstants";

function buildActivityPayload(form, status) {
  return {
    activityDate: form.activityDate || new Date().toISOString().slice(0, 10),
    activityStatus: status,
    note: form.dailyNote,
    ...Object.fromEntries(
      activityNumberFields.map((fieldName) => [
        fieldName,
        Number(form[fieldName] || 0),
      ]),
    ),
  };
}

export default buildActivityPayload;
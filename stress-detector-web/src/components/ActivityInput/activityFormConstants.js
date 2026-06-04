const initialActivityForm = {
  activityDate: new Date().toISOString().slice(0, 10),
  sleepHours: "",
  studyHours: "",
  screenTimeHours: "",
  socialMediaHours: "",
  physicalActivityMinutes: "",
  dailyNote: "",
  moodScore: "0",
  fatigueLevel: "0",
  assignmentLoad: "0",
  deadlinePressure: "0",
};

const activityNumberFields = [
  "sleepHours",
  "studyHours",
  "screenTimeHours",
  "socialMediaHours",
  "physicalActivityMinutes",
  "moodScore",
  "fatigueLevel",
  "assignmentLoad",
  "deadlinePressure",
];

export { activityNumberFields, initialActivityForm };

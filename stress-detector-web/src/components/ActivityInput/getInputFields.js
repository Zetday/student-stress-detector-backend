function getInputFields(t) {
  return [
    {
      name: "sleepHours",
      label: t.ActivitySleepHoursTitle,
      placeholder: t.ActivitySleepPlaceholder,
      description: t.ActivitySleepDescription,
      step: "0.1",
      suffix: t.ActivityHoursSuffix,
      icon: "💤",
    },
    {
      name: "studyHours",
      label: t.ActivityStudyHoursTitle,
      placeholder: t.HourText,
      description: t.ActivityStudyDescription,
      step: "0.1",
      suffix: t.ActivityHoursSuffix,
      icon: "📚",
    },
    {
      name: "physicalActivityMinutes",
      label: t.PhysicalActivityTitle,
      placeholder: t.ActivityPhysicalActivityPlaceholder,
      description: t.ActivityPhysicalDescription,
      suffix: t.ActivityMinutesSuffix,
      icon: "🏃",
    },
    {
      name: "screenTimeHours",
      label: t.ActivityScreenTimeTitle,
      placeholder: t.HourText,
      description: t.ActivityScreenTimeDescription,
      step: "0.1",
      suffix: t.ActivityHoursSuffix,
      icon: "🖥️",
    },
    {
      name: "socialMediaHours",
      label: t.ActivitySocialMediaTitle,
      placeholder: t.HourText,
      description: t.ActivitySocialMediaDescription,
      step: "0.1",
      suffix: t.ActivityHoursSuffix,
      icon: "📱",
    },
  ];
}

export default getInputFields;

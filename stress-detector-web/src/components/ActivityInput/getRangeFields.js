function getRangeFields(t) {
  return [
    {
      name: "assignmentLoad",
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      label: t.ActivityAssignmentLoadTitle,
      description: "Seberapa berat beban tugas Anda?",
      minLabel: t.ActivityLowLabel,
      maxLabel: t.ActivityExtremeLabel,
    },
    {
      name: "deadlinePressure",
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      label: t.DeadlinePressureTitle,
      description: "Seberapa mendesak deadline yang Anda hadapi?",
      minLabel: t.ActivityRelaxedLabel,
      maxLabel: t.ActivityUrgentLabel,
    },
    {
      name: "fatigueLevel",
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      label: t.FatigueLevelTitle,
      description: "Seberapa lelah fisik dan mental yang Anda rasakan?",
      minLabel: t.ActivityFreshLabel,
      maxLabel: t.ActivityExhaustedLabel,
    },
    {
      name: "moodScore",
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      label: t.MoodScoreTitle,
      description: "Bagaimana suasana hati Anda secara keseluruhan?",
      minLabel: t.ActivityBadLabel,
      maxLabel: t.ActivityVeryGoodLabel,
    },
  ];
}

export default getRangeFields;

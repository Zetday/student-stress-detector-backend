from main import predict_stress, UserInput
import json

payload = {
    "sleep_hours": 6.0,
    "study_hours": 4.0,
    "screen_time_hours": 5.0,
    "social_media_hours": 2.0,
    "physical_activity_minutes": 30,
    "caffeine_intake_mg": 100,
    "mood_score": 6,
    "fatigue_level": 5,
    "assignment_load": 7,
    "deadline_pressure": 6,
    "social_interaction_score": 5,
    "financial_worry_score": 4,
    "health_condition_score": 8
}

data = UserInput(**payload)
print("Running test...")
try:
    result = predict_stress(data)
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")

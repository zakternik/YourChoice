import random

from db import db  # Use the MongoDB connection
from datetime import datetime


def retrieve_all_subjects(program_name):
    # Query MongoDB for all subjects in a given program
    subjects = db.schedules.find({"program": program_name}, {"predmet": 1})

    subject_list = [subject["predmet"] for subject in subjects]

    if not subject_list:
        return f"No subjects found for program '{program_name}'."

    return subject_list


def retrieve_schedule(program_name, subject_name, conditions=None):
    # Query MongoDB for the specific subject and program
    query = {
        "program": program_name,
        "predmet": subject_name
    }

    # Set up filters (if conditions are provided)
    start_date = conditions.get('start_date') if conditions else None
    end_date = conditions.get('end_date') if conditions else None

    if start_date and end_date:
        start_date_obj = datetime.strptime(start_date, '%d.%m.%Y')
        end_date_obj = datetime.strptime(end_date, '%d.%m.%Y')

    schedules = db.schedules.find_one(query)

    if not schedules:
        return f"Subject '{subject_name}' not found in program '{program_name}'."

    filtered_entries = []
    for entry in schedules["entries"]:
        match = True

        # Filter by other conditions
        if conditions:
            for key, value in conditions.items():
                if key == 'start_date' or key == 'end_date':
                    continue
                if key in entry and entry[key] != value:
                    match = False
                    break

        # Filter by date range
        if start_date and end_date:
            entry_date = datetime.strptime(entry['Datum'], '%d.%m.%Y')
            if not (start_date_obj <= entry_date <= end_date_obj):
                match = False

        if match:
            filtered_entries.append(entry)

    if not filtered_entries:
        return f"No schedule entries found for subject '{subject_name}' with the provided conditions."

    return filtered_entries


def fetch_all_schedules_transformed():
    # Query MongoDB to get all schedules
    schedules = db.schedules.find({}, {"predmet": 1, "entries": 1})

    all_tasks = []
    colors = [
        '#1abc9c', '#2ecc71', '#3498db', '#9b59b6',
        '#f1c40f', '#e67e22', '#e74c3c', '#34495e',
        '#95a5a6', '#7f8c8d'
    ]

    # Process each schedule
    for schedule in schedules:
        predmet = schedule.get("predmet", "Unknown Subject")

        # Process each entry within the schedule
        for entry in schedule.get("entries", []):
            datum = entry.get("Datum")
            ura = entry.get("Ura")

            # Parse date and time
            try:
                # Extract start and end times from Ura (e.g., "07:00-10:00" -> "07:00" and "10:00")
                start_time_str, end_time_str = ura.split('-')

                # Combine Datum and time strings to form start_time and end_time
                start_datetime = datetime.strptime(f"{datum} {start_time_str}", "%d.%m.%Y %H:%M")
                end_datetime = datetime.strptime(f"{datum} {end_time_str}", "%d.%m.%Y %H:%M")

            except Exception as e:
                # Handle parsing errors
                print(f"Error parsing date or time for entry: {entry}, error: {e}")
                continue  # Skip this entry if parsing fails

            # Randomly choose a color from the specified list
            color = random.choice(colors)

            # Append the transformed entry to the list
            all_tasks.append({
                "name": predmet,
                "color": color,
                "start_time": start_datetime.isoformat()[:-3],
                "end_time": end_datetime.isoformat()[:-3]

            })

    # Return all transformed tasks
    return {"tasks": all_tasks}, 200

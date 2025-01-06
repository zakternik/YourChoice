from bson import ObjectId
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from db import db
import pytz

MAX_REPEAT_DAYS = 365  # Maximum limit for repeating tasks within one year

def set_task(user_id, task_data):
    # Assign a unique ID to the task
    collection = db.users
    task_data["_id"] = ObjectId()

    if "repeat" not in task_data:
        task_data["repeat"] = None  # Default repeat to None if not provided

    # Handle repeatEndDate (optional)
    if "repeatEndDate" in task_data:
        task_data["repeatEndDate"] = datetime.fromisoformat(task_data["repeatEndDate"]).isoformat()

    # Save only the initial task to the user's task list in the database
    result = collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"tasks": task_data}}
    )

    if result.matched_count == 0:
        return {"error": "User not found"}, 404

    # Convert task ID to string for JSON response
    task_data["_id"] = str(task_data["_id"])
    return {"message": "Task added successfully", "task": task_data}, 200

def generate_next_date_interval(start_date, end_date, repeat_type):
    # Calculate task duration (the difference between start and end time)
    duration = end_date - start_date

    # Adjust for repeat types
    if repeat_type == "daily":
        next_start_date = start_date + timedelta(days=1)
    elif repeat_type == "weekly":
        next_start_date = start_date + timedelta(weeks=1)
    elif repeat_type == "monthly":
        next_start_date = start_date + relativedelta(months=1)
    else:
        return None, None  # If no valid repeat type, return None

    # Calculate the new end time for the repeated task
    next_end_date = next_start_date + duration
    return next_start_date, next_end_date

def get_all_tasks(user_id):
    collection = db.users
    user = collection.find_one({"_id": ObjectId(user_id)}, {"tasks": 1})

    if user is None:
        return {"error": "User not found"}, 404

    tasks = user.get("tasks", [])
    current_time = datetime.utcnow().replace(tzinfo=pytz.UTC)  # Make current_time aware

    filtered_tasks = []
    new_tasks = []

    for task in tasks:
        if "startDateTime" in task and "endDateTime" in task:
            start_date = datetime.fromisoformat(task["startDateTime"]).replace(tzinfo=pytz.UTC)  # Make start_date aware
            end_date = datetime.fromisoformat(task["endDateTime"]).replace(tzinfo=pytz.UTC)  # Make end_date aware

            # Check if the repeatEndDate exists
            repeat_end_date = task.get("repeatEndDate")
            if repeat_end_date:
                repeat_end_date = datetime.fromisoformat(repeat_end_date).replace(tzinfo=pytz.UTC)  # Make repeat_end_date aware

            # Process non-repeating tasks (e.g., one-time tasks)
            if end_date > current_time and (not task.get("repeat") or task.get("repeat") == "none"):
                task["_id"] = str(task["_id"])
                filtered_tasks.append(task)

            # Handle repeating tasks (daily, weekly, monthly)
            elif task.get("repeat") in {"daily", "weekly", "monthly"}:
                # The first task occurrence is always based on start_date to end_date
                next_start, next_end = start_date, end_date

                # Only include the task if it is within the repeatEndDate or MAX_REPEAT_DAYS
                if next_end > current_time and (not repeat_end_date or next_end <= repeat_end_date):
                    new_task = task.copy()
                    new_task["_id"] = ObjectId()  # Keep it unique, but don't save to DB
                    new_task["startDateTime"] = next_start.isoformat()
                    new_task["endDateTime"] = next_end.isoformat()
                    new_tasks.append(new_task)
                    new_task["_id"] = str(new_task["_id"])
                    filtered_tasks.append(new_task)

                # Generate subsequent occurrences after the first task
                next_start, next_end = generate_next_date_interval(next_start, next_end, task["repeat"])

                # Generate repeated tasks within the range of repeatEndDate or MAX_REPEAT_DAYS
                while next_end and (not repeat_end_date or next_end <= repeat_end_date):
                    if next_end > current_time:
                        new_task = task.copy()
                        new_task["_id"] = ObjectId()  # Keep it unique, but don't save to DB
                        new_task["startDateTime"] = next_start.isoformat()
                        new_task["endDateTime"] = next_end.isoformat()
                        new_tasks.append(new_task)
                        new_task["_id"] = str(new_task["_id"])
                        filtered_tasks.append(new_task)

                    # Generate the next task occurrence
                    next_start, next_end = generate_next_date_interval(next_start, next_end, task["repeat"])

    return {"tasks": filtered_tasks}, 200


def delete_task(user_id, task_id):
    collection = db.users

    result = collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"tasks": {"_id": ObjectId(task_id)}}}
    )

    if result.matched_count == 0:
        return {"error": "User or task not found"}, 404

    return {"message": "Task deleted successfully"}, 200

def get_tasks_history(user_id):
    collection = db.users
    user = collection.find_one({"_id": ObjectId(user_id)}, {"tasks": 1})

    if user is None:
        return {"error": "User not found"}, 404

    tasks = user.get("tasks", [])
    current_time = datetime.utcnow()

    filtered_tasks = []
    for task in tasks:
        if "endDateTime" in task and datetime.fromisoformat(task["endDateTime"]) < current_time:
            task["_id"] = str(task["_id"])
            filtered_tasks.append(task)

    return {"tasks": filtered_tasks}, 200
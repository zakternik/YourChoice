from bson import ObjectId
from datetime import datetime
from db import db


def set_task(user_id, task_data):
    collection = db.users
    task_data["_id"] = ObjectId()  # Assign a unique ID to each task

    result = collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"tasks": task_data}}
    )

    if result.matched_count == 0:
        return {"error": "User not found"}, 404

    task_data["_id"] = str(task_data["_id"])  # Convert task ID to string for JSON response
    return {"message": "Task added successfully", "task": task_data}, 200


def get_all_tasks(user_id):
    collection = db.users
    user = collection.find_one({"_id": ObjectId(user_id)}, {"tasks": 1})

    if user is None:
        return {"error": "User not found"}, 404

    tasks = user.get("tasks", [])
    # Convert task IDs to strings for JSON serialization
    for task in tasks:
        task["_id"] = str(task["_id"])

    return {"tasks": tasks}, 200


# user_logic.py

def delete_task(user_id, task_id):
    collection = db.users

    result = collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"tasks": {"_id": ObjectId(task_id)}}}
    )

    if result.matched_count == 0:
        return {"error": "User or task not found"}, 404

    return {"message": "Task deleted successfully"}, 200

# routes/auth_routes.py
from urllib.parse import unquote

from flask import Blueprint, jsonify, request

from endpoints.schedule_processor import process_csv_to_db
from endpoints.schedule_retriever import (retrieve_all_subjects,
                                          retrieve_schedule, fetch_all_schedules_transformed)
from endpoints.task_logic import delete_task, get_all_tasks, set_task
from endpoints.user_logic import (delete_user, get_user_data, login_user,
                                  register_user, set_user_data,
                                  update_user_data)

auth_bp = Blueprint('auth', __name__)
schedule_bp = Blueprint('schedule', __name__)
task_bp = Blueprint('task', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    user_data = request.json
    result, status_code = login_user(user_data)
    return jsonify(result), status_code


@auth_bp.route('/register', methods=['POST'])
def register():
    user_data = request.json
    result, status_code = register_user(user_data)
    return jsonify(result), status_code


@auth_bp.route('/user/<user_id>/set-profile', methods=['PUT'])
def set_profile(user_id):
    profile_data = request.json
    result, status_code = set_user_data(user_id, profile_data)
    return jsonify(result), status_code


@auth_bp.route('/user/<user_id>/get-profile', methods=['GET'])
def get_profile(user_id):
    result, status_code = get_user_data(user_id)
    return jsonify(result), status_code


@auth_bp.route('/user/<user_id>', methods=['DELETE'])
def delete_profile(user_id):
    result, status_code = delete_user(user_id)
    return jsonify(result), status_code


@auth_bp.route('/user/<user_id>/update-data', methods=['PUT'])
def update_profile(user_id):
    updated_data = request.json
    result, status_code = update_user_data(user_id, updated_data)
    return jsonify(result), status_code


# Route for processing CSV and saving data to MongoDB
@schedule_bp.route('/upload-schedule', methods=['POST'])
def upload_schedule():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Process the CSV file and save to MongoDB
    file_content = file.read().decode('utf-8')
    result = process_csv_to_db(file_content)

    return jsonify(result), 200


# Route to retrieve all subjects for a program
@schedule_bp.route('/programs/<program_name>/subjects', methods=['GET'])
def get_all_subjects(program_name):
    # Decode the URL-encoded program name and replace + with spaces
    decoded_program_name = unquote(program_name).replace('+', ' ')
    print(decoded_program_name)
    subjects = retrieve_all_subjects(decoded_program_name)
    return jsonify(subjects), 200


# Route to retrieve schedule for a specific subject
@schedule_bp.route('/programs/<program_name>/subjects/<subject_name>', methods=['GET'])
def get_schedule(program_name, subject_name):
    # Decode the URL-encoded program and subject names and replace + with spaces
    decoded_program_name = unquote(program_name).replace('+', ' ')
    decoded_subject_name = unquote(subject_name).replace('+', ' ')

    conditions = request.args.to_dict()
    schedule = retrieve_schedule(decoded_program_name, decoded_subject_name, conditions)
    return jsonify(schedule), 200

# Route to retrieve all formatted schedule data
@schedule_bp.route('/schedules/all', methods=['GET'])
def get_all_formatted_schedules():
    result, status_code = fetch_all_schedules_transformed()
    return jsonify(result), status_code
# Route to add a new task
@task_bp.route('/user/<user_id>/tasks', methods=['POST'])
def add_task(user_id):
    task_data = request.json
    result, status_code = set_task(user_id, task_data)
    return jsonify(result), status_code


# Route to retrieve all tasks for a user
@task_bp.route('/user/<user_id>/tasks', methods=['GET'])
def retrieve_tasks(user_id):
    result, status_code = get_all_tasks(user_id)
    return jsonify(result), status_code


# Route to delete a specific task
@task_bp.route('/user/<user_id>/tasks/<task_id>', methods=['DELETE'])
def remove_task(user_id, task_id):
    result, status_code = delete_task(user_id, task_id)
    return jsonify(result), status_code

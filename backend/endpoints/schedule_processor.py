from db import db  # Use the MongoDB connection from your app
import csv
import io
from flask import Response

def preprocess_csv(csv_file):
    """Remove only the first occurrence of the 'Skupina' line in the CSV file."""
    lines = csv_file.splitlines()  # Expecting csv_file as a string, split into lines

    # Remove the first 'Skupina' line by finding and skipping it
    for i, line in enumerate(lines):
        if 'Skupina' in line:
            return lines[:i] + lines[i + 1:]

    # If no 'Skupina' line is found, return the original lines
    return lines


def process_csv_to_db(csv_file):
    # Preprocess the CSV to remove the first 'Skupina' line
    lines = preprocess_csv(csv_file)

    # Initialize variables
    program = letnik = smer = predmet = ''
    program_data = {}

    # Iterate over each line
    for line in lines:
        parts = line.strip().split(';')

        # Handle program, letnik, and smer
        if 'Program' in line:
            program = parts[3].strip()
        elif 'Letnik' in line:
            letnik = parts[3].strip()
        elif 'Smer' in line:
            smer = parts[3].strip()
            # Construct program_full using the delimiter "; "
            program_full = f'{program}; Letnik {letnik}; {smer}'
            program_data.setdefault(program_full, {})  # Initialize program in dictionary if not already present
        # Detect subject
        elif line.startswith(';') and not parts[2].strip():
            predmet = parts[1].strip()
            program_data[program_full].setdefault(predmet, [])  # Initialize subject list if not already present
        # Skip header line
        elif 'Dan' in line and 'Datum' in line:
            continue
        # Process actual data lines
        else:
            if len(parts) >= 11:
                entry = {
                    'Dan': parts[1].strip(),
                    'Datum': parts[2].strip(),
                    'Ura': parts[4].strip(),
                    'Prostor': parts[5].strip(),
                    'Izvajanje': parts[6].strip(),
                    'Skupina': parts[8].strip(),  # Skupina from the actual schedule entry
                    'Izvajalec': parts[10].strip(),
                }
                # Append entry to the corresponding subject within the program
                program_data[program_full][predmet].append(entry)

    # Insert processed data into MongoDB
    for program_full, subjects in program_data.items():
        for predmet, schedule_entries in subjects.items():
            db.schedules.update_one(
                {"program": program_full, "predmet": predmet},
                {"$set": {"entries": schedule_entries}},
                upsert=True
            )

    return {"message": "Data has been saved to MongoDB."}

def export_to_csv():
    # Pridobi vse urnike iz MongoDB
    schedules = db.schedules.find()  # To pridobi vse dokumente iz zbirke

    if schedules:
        # Seznam za shranjevanje podatkov
        rows = []

        # Iteriraj po vseh urnikih
        for schedule in schedules:
            program = schedule.get("program", "Unknown Program")
            
            if ";" in program:
                program, letnik, smer = program.split(";", 2)  # Loči na osnovi prvega podpičja
                program = program.strip()  # Odstrani morebitne začetne in končne presledke
                letnik = letnik.strip()  # Odstrani morebitne začetne in končne presledke
                smer = smer.strip()  # Odstrani morebitne začetne in končne presledke
            else:
            # Če ni podpičja, pusti vrednost
                smer = "Unknown Smer"
                letnik = letnik.strip()

            predmet = schedule.get("predmet", "Unknown Predmet")

            rows.append(["", "Program", "", program])
            rows.append(["", "Letnik", "", letnik])
            rows.append(["", "Smer", "", smer])
            rows.append(["", "Skupina", "", ""])
            rows.append(["", predmet])
            rows.append([])

            rows.append(["", "Dan", "Datum", "", "Ura", "Prostor", "Izvajanje", "", "Skupina", "Izvajalec"])

            for entry in schedule.get("entries", []):
                row = [
                    "",
                    entry.get("Dan", ""),
                    entry.get("Datum", ""),
                    "",
                    entry.get("Ura", ""),
                    entry.get("Prostor", ""),
                    entry.get("Izvajanje", ""),
                    "",
                    entry.get("Skupina", ""),
                    entry.get("Izvajalec", "")
                ]
                rows.append(row)

        # Ustvarimo vmesni spomin (in-memory file) za CSV vsebino
        output = io.StringIO()
        writer = csv.writer(output, delimiter=";")
        writer.writerows(rows)
        
        csv_content = output.getvalue().encode("utf-8-sig").decode("utf-8")
        # Vrni CSV vsebino kot odgovor z ustreznimi glavami
        response = Response(csv_content, mimetype="text/csv; charset=utf-8")
        response.headers["Content-Disposition"] = "attachment; filename=urnik.csv"
        return response

    else:
        return {"message": "No schedules found"}
import axios from 'axios';
import Cookie from "js-cookie";
import { useEffect, useRef, useState } from "react";
import '../../App.css';
import env from "../../env.json";
import './calendar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function getStartOfWeek(date) {
    const dayOfWeek = date.getDay();
    const difference = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(difference));
}

function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

const filters = [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#34495e',
    '#95a5a6',
    '#7f8c8d',
];

const program_names = [
    "RAČUNALNIŠTVO IN INFORMACIJSKE TEHNOLOGIJE; Letnik 1; MAG RIT - RAČUNALNIŠTVO IN INFORMACIJSKE",
    "MEDIJSKE KOMUNIKACIJE (BM50) - 2. stopnja; Letnik 1; MAG MK - MEDIJSKE KOMUNIKACIJE (BM50)",
    "TELEKOMUNIKACIJE (BM40) - 2. stopnja; Letnik 1; MAG TK - TELEKOMUNIKACIJE (BM40)"
];

const tmpdata = [
    { "task_name": "overflow: hidden;", "description": "neke neke", "color": '#e74c3c', "start_time": "2024-10-22T14:00:00", "end_time": "2024-10-22T16:00:00" },
    { "task_name": "task2", "description": "neke neke", "color": '#9b59b6', "start_time": "2024-10-22T14:00:00", "end_time": "2024-10-23T16:00:00" },
    { "task_name": "task3", "description": "neke neke", "color": "#2ecc71", "start_time": "2024-10-23T18:00:00", "end_time": "2024-10-24T20:00:00" },
    { "task_name": "task4", "description": "neke neke", "color": "#7f8c8d", "start_time": "2024-10-24T22:00:00", "end_time": "2024-10-25T23:00:00" }
];

function getProgramDisplayName(program) {
    // Razdelimo po prvi vejici
    const parts = program.split(';');
    return parts.slice(0, 2).join(';').trim();  // Združimo prvi in drugi del
}

function Calendar() {
    const [signedIn, setSignedIn] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const fileInputRef = useRef(null);
    const [program_name, setProgramName] = useState(program_names[0]);

    useEffect(() => {
        if (Cookie.get("signed_in_user") !== undefined) {
            const user = JSON.parse(Cookie.get("signed_in_user"));
            setSignedIn(user);

            // Fetch tasks and schedules in parallel
            Promise.all([
                axios.get(`${env.api}/task/user/${user._id}/tasks`),
                axios.get(`${env.api}/schedule/schedules/${program_name}`)
            ])
                .then(([taskResponse, scheduleResponse]) => {
                    const userTasks = taskResponse.data.tasks;
                    const schedules = scheduleResponse.data.tasks;  // Assuming schedules are in 'tasks'

                    // Map over schedules to match task properties
                    const formattedSchedules = schedules.map(schedule => ({
                        _id: user._id,
                        name: schedule.name,
                        color: schedule.color,
                        startDateTime: schedule.start_time,  // Rename to match tasks' format
                        endDateTime: schedule.end_time       // Rename to match tasks' format
                    }));

                    // Combine user tasks and formatted schedules into a single array
                    const combinedTasks = [...userTasks, ...formattedSchedules];
                    setTasks(combinedTasks);

                    // Log the combined tasks array
                    console.log("Fetched and combined tasks:", combinedTasks);
                })
                .catch((error) => {
                    console.error("Error fetching tasks or schedules:", error);
                });
        } else {
            setSignedIn(false);
        }
    }, [program_name]);


    const handlePrevWeek = () => {
        setCurrentWeek(addDays(currentWeek, -7));
    };

    const handleNextWeek = () => {
        setCurrentWeek(addDays(currentWeek, 7));
    };

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        weekDays.push(addDays(currentWeek, i));
    }

    const timeSlots = [];
    for (let i = 0; i < 24 * 2; i++) {
        const hours = Math.floor(i / 2);
        const minutes = i % 2 === 0 ? "00" : "30";
        timeSlots.push(`${hours.toString().padStart(2, '0')}:${minutes}`);
    }

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const filteredTasks = tasks.filter(task => {
        const startDate = new Date(task.startDateTime);
        const endDate = new Date(task.endDateTime);

        return weekDays.some(day => (
            (startDate <= day && endDate >= day) // Checks if the task spans across the week
        ));
    });



    const renderTaskInTimeSlot = (day, slot) => {
        const dayTasks = tasks.filter(task => {
            const taskStart = new Date(task.startDateTime);
            const taskEnd = new Date(task.endDateTime);
            const slotHour = parseInt(slot.split(":")[0]);
            const slotMinutes = parseInt(slot.split(":")[1]);

            const slotTime = new Date(day);
            slotTime.setHours(slotHour, slotMinutes, 0, 0);
            // Adjust to include entire range on the given day
            return (taskStart <= slotTime && taskEnd > slotTime);
        });

        return dayTasks.map((task, index) => (
            selectedFilter !== null && task.color !== filters[selectedFilter] ? null : (
                <p key={index} className="task-ribbon" style={{ backgroundColor: task.color }}>
                    <b>{/*⠀*/task.name}</b>
                </p>
            )
        ));
    };


    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "text/csv") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = e.target.result;
                // console.log(csvData);

                const formData = new FormData();
                formData.append("file", file);

                axios.post(`${env.api}/schedule/upload-schedule`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((error) => {
                        console.error("Error uploading file:", error);
                    });
            };
            reader.readAsText(file);
        } else {
            alert("Please select a valid CSV file.");
        }
    };

    const handleFileExport = () => {
        axios.get(`${env.api}/schedule/export-schedule`, { responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'schedule.csv'); // The name of the file to download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);  // Cleanup the DOM after download
            })
            .catch(error => {
                console.error('Error exporting schedule:', error);
            });
    };


    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button className="change-week" onClick={handlePrevWeek}>←</button>
                <h2>Week of {currentWeek.toDateString()}</h2>
                <button className="change-week" onClick={handleNextWeek}>→</button>
            </div>
            <button className="scroll-to-bottom" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
    <i className="fas fa-calendar-alt" style={{marginRight: '0.5rem'}}></i> Go to Schedule Management
</button>
            <div className="program-names">
                <label htmlFor="program-select">Select Program:</label>
                <select
                    id="program-select"
                    onChange={(e) => setProgramName(e.target.value)}
                    value={program_name}
                >
                    {program_names.map((program, index) => (
                        <option key={index} value={program}>
                            {getProgramDisplayName(program)}  {/* Prikazujemo samo del pred drugo vejico */}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filters">
                <div>Filter:</div>
                {filters.map((filter, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedFilter(index)}
                        className={`${selectedFilter === index ? 'active-filter' : 'filter'}`}
                        style={{ backgroundColor: filter }}
                    >
                        ⠀
                    </div>
                ))}
                <div className="clear-filter" onClick={() => setSelectedFilter(null)}>Clear</div>
            </div>
            <div className="calendar-grid-wrapper">
                <div className="time-label-column">
                    {timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="time-label">{slot}</div>
                    ))}
                </div>
                <div className="calendar-grid">
                    {weekDays.map((day, index) => {
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        return (
                            <div key={index}>
                                <h3 className={`calendar-days-header ${isWeekend ? "weekend" : ""}`}>{day.toDateString()}</h3>
                                <div className="calendar-day">
                                    <div className="time-slots">
                                        {timeSlots.map((slot, slotIndex) => (
                                            <div key={slotIndex} className="time-slot">
                                                <div className="content-area">
                                                    {renderTaskInTimeSlot(day, slot)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {signedIn !== false ? (
                <div className="action-section">
                    <div className="action-card">
                        <h3>Schedule Management</h3>
                        <div className="buttons-wrapper">
                            <label htmlFor="file-upload" className="import-label">Import schedule</label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".csv"
                                ref={fileInputRef}
                                onChange={handleFileImport}
                            />
                            <button className="export-button" onClick={handleFileExport}>Export schedule</button>
                        </div>
                    </div>
                </div>

            ) : null
            }
        </div>
    );
}

export default Calendar;

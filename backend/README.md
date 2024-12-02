# Prerequisites

After clone, run pip install -r requirements.txt


# Docker

## Prerequisites

You will need to have the following installed on your system:

- git
- docker
- docker compose

## Instructions

Create a .env file in the root of the backend project and fill in the variables with your values:
```
BACKEND_PORT=1234
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>.hul1s.mongodb.net/
```

Run `./setup_docker.sh` script.


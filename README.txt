Nature, Noticed - Deliverable 2
================================

GitHub repository: https://github.com/KP23545756/IMY220-Project

MongoDB Atlas connection string:
MONGO_URI=mongodb+srv://Kyle:Kleptonico0507@cluster0.0jcji5o.mongodb.net/nature-noticed?appName=Cluster0

Running with Docker (from the project root)
--------------------------------------------
Build and start everything:
    docker compose up --build

Then open http://localhost:5173

Stop and remove the containers:
    docker compose down

Test logins (password for all: password123)
    maya@example.com
    jorge@example.com

Equivalent manual commands
--------------------------
    docker build -t nature-noticed-backend ./backend
    docker build -t nature-noticed-frontend ./frontend
    docker network create nn-net
    docker run -d --name backend --network nn-net -p 5000:5000 --env-file ./backend/.env nature-noticed-backend
    docker run -d --name frontend --network nn-net -p 5173:5173 -e VITE_API_PROXY_TARGET=http://backend:5000 nature-noticed-frontend
Nature, Noticed - Deliverable 1

Project structure:

frontend/   Vite React application (src/components, src/pages, src/assets)
backend/    Express server with stubbed sign-up / sign-in endpoints

Docker run:

From the project root (the folder containing /frontend,
/backend) run:

	docker compose up --build

This builds and starts both containers together:
- backend  -> http://localhost:5000
- frontend -> http://localhost:5173
 
Open http://localhost:5173 in your browser once both containers show
as running. 

To stop:
 
	docker compose down


Website guide:

http://localhost:5173 is the login/sign-up page (it does not automatically
redirect to home upon successful login/sign-in yet)

To navigate to home add /home to the url (http://localhost:5173/home) 

and the rest of the project can be navigated from there.
Should you choose to go back to login/sign-up, you will
have to re-enter the home web address in the url to get back.

GitHub repository: https://github.com/KP23545756/IMY220-Project


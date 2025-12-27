@echo off
cd backend
call npx knex migrate:latest
call npx knex seed:run
pause
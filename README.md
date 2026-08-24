# DB SCHEMA
accounts
id: uuid ( PK )
email: string

projects
id: uuid ( pk )
name: string
ownerID: accounts.id (FK)

projectMembers
id: uuid (pk)
projectID: projects.id ( FK )
userID: accounts.id ( FK )

tasks:
id: uuid (pk)
name: string
desc: string
status: string
due_date: date
projectID: projects.id ( FK )
assignedTo: accounts.id ( FK )
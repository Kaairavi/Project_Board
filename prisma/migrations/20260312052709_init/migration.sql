-- CreateTable
CREATE TABLE "projects" (
    "ProjectID" SERIAL NOT NULL,
    "ProjectName" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "CreatedBy" INTEGER,
    "CreatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("ProjectID")
);

-- CreateTable
CREATE TABLE "roles" (
    "RoleID" INTEGER NOT NULL,
    "RoleName" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("RoleID")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "CommentID" SERIAL NOT NULL,
    "TaskID" INTEGER,
    "UserID" INTEGER,
    "CommentText" VARCHAR(255) NOT NULL,
    "CreatedAt" VARCHAR(45),

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("CommentID")
);

-- CreateTable
CREATE TABLE "task_history" (
    "HistoryID" SERIAL NOT NULL,
    "TaskID" INTEGER,
    "ChangedBy" INTEGER,
    "ChangeType" VARCHAR(50) NOT NULL,
    "ChangeTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_history_pkey" PRIMARY KEY ("HistoryID")
);

-- CreateTable
CREATE TABLE "tasklists" (
    "ListID" SERIAL NOT NULL,
    "ProjectID" INTEGER,
    "ListName" VARCHAR(100) NOT NULL,

    CONSTRAINT "tasklists_pkey" PRIMARY KEY ("ListID")
);

-- CreateTable
CREATE TABLE "tasks" (
    "TaskID" SERIAL NOT NULL,
    "ListID" INTEGER,
    "AssignedTo" INTEGER,
    "Title" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Priority" VARCHAR(10),
    "Status" VARCHAR(20),
    "CreatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "DueDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("TaskID")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "UserRoleID" SERIAL NOT NULL,
    "UserID" INTEGER,
    "RoleID" INTEGER,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("UserRoleID")
);

-- CreateTable
CREATE TABLE "users" (
    "UserID" SERIAL NOT NULL,
    "UserName" VARCHAR(50) NOT NULL,
    "Email" VARCHAR(100) NOT NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "CreatedAt" DATE,

    CONSTRAINT "users_pkey" PRIMARY KEY ("UserID")
);

-- CreateIndex
CREATE INDEX "Projects_Users_idx" ON "projects"("CreatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "RoleName_UNIQUE" ON "roles"("RoleName");

-- CreateIndex
CREATE INDEX "Task_TaskComments_idx" ON "task_comments"("TaskID");

-- CreateIndex
CREATE INDEX "Users_TaskComments_idx" ON "task_comments"("UserID");

-- CreateIndex
CREATE INDEX "TaskHistory_Tasks_idx" ON "task_history"("TaskID");

-- CreateIndex
CREATE INDEX "TaskHistory_Users_idx" ON "task_history"("ChangedBy");

-- CreateIndex
CREATE INDEX "Project_Task_idx" ON "tasklists"("ProjectID");

-- CreateIndex
CREATE INDEX "Tasks_TaskList_idx" ON "tasks"("ListID");

-- CreateIndex
CREATE INDEX "Tasks_User_idx" ON "tasks"("AssignedTo");

-- CreateIndex
CREATE INDEX "UserRole_Role_idx" ON "user_roles"("RoleID");

-- CreateIndex
CREATE INDEX "UserRole_Users_idx" ON "user_roles"("UserID");

-- CreateIndex
CREATE UNIQUE INDEX "UserName_UNIQUE" ON "users"("UserName");

-- CreateIndex
CREATE UNIQUE INDEX "Email_UNIQUE" ON "users"("Email");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "Projects_Users" FOREIGN KEY ("CreatedBy") REFERENCES "users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "Task_TaskComments" FOREIGN KEY ("TaskID") REFERENCES "tasks"("TaskID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "Users_TaskComments" FOREIGN KEY ("UserID") REFERENCES "users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_history" ADD CONSTRAINT "TaskHistory_Users" FOREIGN KEY ("ChangedBy") REFERENCES "users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasklists" ADD CONSTRAINT "Project_Task" FOREIGN KEY ("ProjectID") REFERENCES "projects"("ProjectID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "Tasks_TaskList" FOREIGN KEY ("ListID") REFERENCES "tasklists"("ListID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "Tasks_User" FOREIGN KEY ("AssignedTo") REFERENCES "users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "UserRole_Role" FOREIGN KEY ("RoleID") REFERENCES "roles"("RoleID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "UserRole_Users" FOREIGN KEY ("UserID") REFERENCES "users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

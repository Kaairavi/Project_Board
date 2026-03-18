// import { PrismaClient } from "../app/generated/prisma/client.js";
// import sql from "mssql";

// // Prisma client is generated to app/generated/prisma; options asserted so script can use DATABASE_URL from env
// const prisma = new PrismaClient({} as never);

// const sqlConfig = {
//   user: "root",
//   password: "Rm@2006",
//   server: "localhost",
//   database: "to_do_list",
//   options: {
//     encrypt: false,
//   },
// };

// async function migrate() {
//   await sql.connect(sqlConfig);

//   const users = await sql.query`SELECT * FROM Users`;

//   for (const user of users.recordset) {
//     await prisma.users.create({
//       data: {
//         UserName: user.UserName,
//         Email: user.Email,
//         PasswordHash: user.PasswordHash,
//         CreatedAt: user.CreatedAt,
//       },
//     });
//   }

//   console.log("Users migrated");
// }

// migrate();
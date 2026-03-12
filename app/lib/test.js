const bcrypt = require("bcrypt");
(async () => {
    const password = 'member1';
    const saltRounds = 10;

    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log("Your secure hash:", hash);
})();
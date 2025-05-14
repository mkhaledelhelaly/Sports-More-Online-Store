const router = require('express').Router();
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = parseInt(process.env.SALT_ROUNDS);


//Register
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
      }
      
});


//Login
router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne({username: req.body.username});
        if (!user) return res.status(404).json("User not found!");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password!");

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin, username: user.username   // this is important
        }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken: token });
    }
    catch (err) {
        console.error("Error during login:", err);
        res.status(500).json(err);
    }
})


module.exports = router;
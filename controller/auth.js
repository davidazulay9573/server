const { User } = require("../model/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const users = {};

const signup = async (req, res) => {
    try {
        const { name,  phone, email, password } = req.body;
        if (!name || !phone || !email || !password){
            res.status(400).send({message : "bad request"})
            return;
        }

        if (await User.findOne({ email })) {
            res.status(409).send({message : "User already exists"});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ ...req.body, password : hashedPassword });
        user.code = generateVerificationCode();

        users[user._id] = user;

        setTimeout(() => {
            delete users[user._id]; 
        }, 1000 * 60 * 30);
       
        sendAuthEmail({...req.body, code : user.code, id : user._id});

        res.status(200).json({ message: "Check your email" });
    } catch (error) {
        res.status(400).send({ message: "Failed to signup"});
    }
};

const verify = async (req, res) => {
    const { userId, code } = req.query;

    if (!code || !userId) {
        return res.status(400).send({ message: "bad request"});
    }
    
    console.log(users[userId].code);
    
    if (users[userId] && users[userId].code == code) {
        res.status(200).send({ message: "Verification successful"});
        const user = users[userId];

        await user.save();

    } else {
        res.status(303).redirect("https://google.com/");
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if ( !email || !password) {
            res.status(400).send({ message: "Bad request" });
            return;
        }

        const user = await User.findOne({ email: email });
     
        if (!user) {
            res.status(400).send({message : "User with email and password not found"});
            return;
        }
    
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            res.status(400).send({message : "User with email and password not found"});
            return;
        }

        const token = generateToken(user);
      
        res.status(200)
            .cookie('token', token, {  maxAge: 1800000 }) 
            .send({ message: "signin successful" });
        
    } catch (error) {
        res.status(400).send({message : "signin failed"});
    }
};

const signout = (req, res) => {
    res.clearCookie('token'); 
    res.status(200).send({ message: "signout successful" });
};

/* -------------------------------------------- */
function generateVerificationCode(){
    return Math.floor(100000 + Math.random() * 900000).toString(); 
};

function generateToken(user){
     return jwt.sign(
        {
          _id: user._id,
          role : user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );
}

async function sendAuthEmail(user){ 
    const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
            user: process.env.MAIL,
            pass: process.env.MAIL_PASS
        }
    });
    
    const mailContent = {
        from: `Bank ${process.env.MAIL}`, 
        to: user.email,
        subject: 'Verify your email',
        html: `<p>Hi ${user.name},</p><p>Please verify your account by clicking the following link: <a href="http://localhost:3001/auth/verify?userId=${user.id}&code=${user.code}">Verify your account</a></p>` 
    };

    await transporter.sendMail(mailContent);
}

module.exports = { verify, signup, signin, signout };


const { User } = require("../model/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const users = {};

const signup = async (req, res) => {
    try {
        const { name,  phone, email, password } = req.body;
        if (!name || !phone || !email || !password){
            res.status(400).send("bad request")
            return;
        }

        if (await User.findOne({ email })) {
            res.status(409).send("User already exists");
            return;
        }

        const code = generateVerificationCode();
        const hashedPassword = await bcrypt.hash(password, 10);

        users[code] = new User({ ...req.body, password : hashedPassword });

        sendAuthEmail({...req.body, code});

        res.status(200).json({ message: "Check your email" });
    } catch (error) {
        res.status(400).send("Failed to signup");
    }
};

const verify = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Verification code is missing");
    }
    
    if (users[code]) {
        res.status(200).send("Verification successful");
        const user = users[code];
        await user.save();

    } else {
        res.status(400).send("Invalid verification code");
    }
};


const signin = async (req, res) => {

    try {
        const user = await User.findOne({ email: req.body.email });
     
        if (!user) {
            res.status(409).send("user with email and password not found");
            return;
        }
    
        const isValidPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );

        if (!isValidPassword) {
          res.status(400).send("user with email and password not found");
          return;
        }

        const token = generateToken(user);
      
        res.status(200).send({ token });

      } catch (error) {
        res.status(400).send("login user fail");
      }
}

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
        process.env.JWT_SECRET
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
        html: `<p>Hi ${user.name},</p><p>Please verify your account by clicking the following link: <a href="http://localhost:3001/auth/verify?code=${user.code}">Verify your account</a></p>` 
    };

    await transporter.sendMail(mailContent);
}

module.exports = { verify, signin, signup };


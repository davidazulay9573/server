const { User } = require("../model/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const verificationCodes = {};

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
};

const signup = async (req, res) => {
    try {
        const { email, phone, name, password } = req.body;

        if (await User.findOne({ email })) {
            res.status(409).send("User already exists");
            return;
        }

        const verificationCode = generateVerificationCode();
        verificationCodes[verificationCode] = new User({ email, phone, name, password });

        const transporter = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: process.env.MAIL,
                pass: process.env.MAIL_PASS
            }
        });

        const mailContent = {
            from: `Your App Name ${process.env.MAIL}`, 
            to: email,
            subject: 'Verify your email',
            html: `<p>Hi ${name},</p><p>Please verify your account by clicking the following link: <a href="http://localhost:3001/auth/verify?code=${verificationCode}">Verify your account</a></p>` // html body
        };

        await transporter.sendMail(mailContent);

        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        console.error(error);
        res.status(400).send("Failed to send verification code");
    }
};

const verify = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Verification code is missing");
    }

    if (verificationCodes[code]) {
        res.status(200).send("Verification successful");
        const user = verificationCodes[code];
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

        const token = jwt.sign(
            {
              _id: user._id,
              role : user.role
            },
            process.env.JWT_SECRET
          );
      
        res.status(200).send({ token });

      } catch (error) {
        res.status(400).send("login user fail");
      }
}

module.exports = { verify, signin, signup };


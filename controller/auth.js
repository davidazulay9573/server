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
        await user.save();
       
        sendAuthEmail({...req.body, id : user._id});

        res.status(200).json({ message: "Check your email" });
    } catch (error) {
        res.status(400).send({ message: "Failed to signup"});
    }
};

const verify = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).send({ message: "bad request"});
    }

    if (await User.findOneAndUpdate({ _id: userId, status : "pending" }, { status: 'active' })){
        res.status(200).redirect("http://google.com");
    }else{
        res.status(400).send({ message: "Verification fail"});
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
     
        if (!user || user.status != "active") {
            res.status(400).send({message : "User with email and password not found"});
            return;
        }
    
        if (!await bcrypt.compare(password, user.password)) {
            res.status(400).send({message : "User with email and password not found"});
            return;
        }

        const token = generateToken(user);
      
        res.status(200)
            .send({ token });
        
    } catch (error) {
        res.status(400).send({message : "signin failed"});
    }
};

const signout = (req, res) => {
    res.clearCookie('token'); 
    res.status(200).send({ message: "signout successful" });
};

/* -------------------------------------------- */
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
        html: `<p>Hi ${user.name},</p><p>Please verify your account by clicking the following link: <a href="http://localhost:3001/auth/verify?userId=${user.id}">Verify your account</a></p>` 
    };

    await transporter.sendMail(mailContent);
}

module.exports = { verify, signup, signin, signout };


const { Transaction } = require("../model/transaction");
const { User } = require("../model/user");

const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction.find({
            $or: [
                { from: userId },
                { to: userId }
            ]
        });

        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
};

const createTransaction = async (req, res) => {

    // const session = await mongoose.startSession(); 
  
    try {
        const from = req.user.id; 
        const { to, amount } = req.body;
        

        if (!to || !amount) {
            res.status(400).send({ message: "bad request" });
            return;
        }

        const sender = await User.findOne({ _id: from });
        const receiver = await User.findOne({ email: to });

        if (!sender || !receiver) {
            res.status(404).send({ message: "sender or receiver not found." });
            return;
        }

        if (sender.balance < amount) {
            res.status(400).send({ message: "there is not enough money in the account" });
            return;
        }
       
        const transaction = new Transaction({
            from: sender._id,
            to: receiver._id,
            amount
        });

        sender.balance -= Number.parseInt(amount);
        receiver.balance += Number.parseInt(amount);

        // session.startTransaction(); 
        
        await Promise.all([
            transaction.save(),
            sender.save(),    
            receiver.save()   
        ]);

        // await session.commitTransaction();
        // session.endSession();

        res.status(201).send({ message: "Transaction successful", transaction });

    } catch (error) {
        // await session.abortTransaction();
        // session.endSession();
        res.status(400).send(error);
    }
};


module.exports = { getTransactions, createTransaction}
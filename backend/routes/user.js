const express = require('express');
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config")
const { authMiddleware } = require('../middleware')
const router = express.Router();

const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.post("/signup", async (req, res) => {
    const body = req.body;
    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        return res.json({
            message: "Username already taken / Incorrect Inputs"
        })
    }

    const user = await User.findOne({
        username: body.username
    })

    if(user._id){
        return res.json({
            message: "Username already taken / Incorrect Inputs"
        })
    }

    const dbUser = await User.create(body)
    const token = jwt.sign({
        userId: dbUser._id
    }, JST_SECRET)
    res.json({
        message: "User created successfully",
	    token: token
    })
})

router.post("/signin", async (req, res) =>{
    const body = req.body;
    const {success} = signinSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Incorrect Inputs"
        })
    }

    const user = await User.findOne({
        username: body.username,
        password: body.password
    })

    if(user) {
        const token = jwt.sign({
            userID: user._id
        }, JWT_SECRET)

        res.status(200).json({
            token: token
        })
        return;
    }

    res.status(411).json({
        message: "Error while logging in"
    })
})

router.put("/". authMiddleware, async (req,res) =>{
    const { success } = updateBody.safeParse(req.body)
    if(!success){
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        id: req.userId
    })

    res.json({
        message: "Updated Successfully!"
    })
})





module.exports = router;
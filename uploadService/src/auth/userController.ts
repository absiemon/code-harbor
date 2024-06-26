import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from './generateAccessToken';
import { LoginRequestBody, RegisterRequestBody, updateProfileRequestBody, userFields } from './types';
import { RequestWithUser } from '../utills/verifyToken';
const prisma = new PrismaClient();

//API for User Registration 
export const registerUser = async (req: Request, res: Response) => {
    const { first_name, last_name, email, password } = req.body as RegisterRequestBody;

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
    }

    //criteria pasword sould be 6 char long contains one lowercase, uppercase, number and special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).*$/;
    if (password.length < 6 && !regex.test(password)) {
        return res.status(400).json({ 
            error: 'Password should be 6 char long contains one lowercase, uppercase, number and special char' 
        });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //generating username.

    //generate 4 digit random number
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const username = first_name + '_' + last_name  + randomNumber.toString();

    try {
        // Create the user
        const newUser = await prisma.user.create({
            data: {
                first_name,
                last_name,
                email: email,
                password: hashedPassword,
                username: username,
                session_id: "anything"
            },
            select: userFields,
        });

        //generating token
        const payload = {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username
        }
        try {
            const token: string = await generateToken(payload)
            return res.status(201).json({data: newUser, accessToken: token});
        } catch (error) {
            return res.status(500).json({ error: "Error in generating token", details: error});
        }

    } catch (error) {
        
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

//Api for login user    
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequestBody;

    try {
        // Find the user by email
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generating token
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };

        //excluding password
        const newUser = {
            id: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name,
            username: user.username, 
            session_id: user.session_id,
            email: user.email, 
            created_at: user.created_at,
        }

        const token: string = await generateToken(payload);
        return res.json({ data: newUser, accessToken: token });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

export const updateUser = async (req: RequestWithUser, res: Response) => {
    // Checking if req.user exists because we have inserted user details in req.user after token verification.
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const userId = req.user.id;
    const dataToUpdate : updateProfileRequestBody = req.body;

    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
               ...dataToUpdate
            },
        });

        return res.status(200).json({
            message: "Profile updated successfully!"
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });

    }
};
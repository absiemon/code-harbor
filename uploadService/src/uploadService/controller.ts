import { Request, Response } from 'express'
import { generateHexCode } from '../utills/generateRandomId';
import simpleGit from 'simple-git';
import * as path from 'path';
import * as fs from 'fs-extra'
import { uploadFile } from '../config/supabaseS3';
import { getAllFiles } from '../utills/getAllFilesFolder';
import { createRedisClient } from '../config/redisConfig';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from '../utills/verifyToken';

const prisma = new PrismaClient();

export const uploadCodebase = async (req: RequestWithUser, res: Response) => {
    
    try {
        const {repoUrl, project_name, build_folder}  = req.body;

        const username = req.user?.username || "abhay1222"
        const id = generateHexCode();
    
        const project_id = project_name + '_' + id;
        const path_location = `${username}/original/${project_id}`

        try {
            await simpleGit().clone(repoUrl, path_location)
        } catch (error) {
            return res.status(500).json({ error: "Error in cloning repository", details: error })
        }

        //After uploading getting all files in an array with absolute path
        const files = getAllFiles(path_location);

        //uploading all the files one by one to object storage
        await Promise.all(files.map(async (file) => {
            await uploadFile(file);
        }));

        //putting deployed code Id into redis queue so that deployment service pull
        const publisher = await createRedisClient()

        const data = {path_location, build_folder, username, project_id}
        
        await publisher.lPush('build-queue', JSON.stringify(data))
        await publisher.expire('build-queue', 3600)

        //setting the status of deployment in the redis DB
        await publisher.hSet('status', project_id, 'uploaded')

        //deleting the locally cloned repo after uploading to supabase storage.
        await fs.remove(username);

        console.log("removed locally cloned repo!")

        return res.status(200).json({
            message: "Project cloned successfully",
            project_id
        })

    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error })
    }
}

//Api to get all the projects of the user
export const getAllProjects = async (req: RequestWithUser, res: Response) => {
    //adding pagination
    const page = parseInt(req.query.page as string) || 1; 
    const pageSize = parseInt(req.query.pageSize as string) || 10; 
    const createdAtAsc = req.query.createdAtAsc as string; 

    try {

        let sortBy: any = []
        if(createdAtAsc){
            createdAtAsc === 'true' ? 
            sortBy.push({ created_at: 'asc'}) : 
            sortBy.push({ created_at: 'desc'})
        }

        const user_id = req.user?.id as string;
         //counting total available records
         const totalCount = await prisma.project.count({
            where: {
                user_id: user_id,
            }
        });
        const totalPages = Math.ceil(totalCount / pageSize);

        //getting all the courses created by a user
        const projects = await prisma.project.findMany({
            where: {
                user_id: user_id,
            },
            orderBy: sortBy,
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        return res.status(200).json({
            data: projects,
            totalPages,
            currentPage: page,
            pageSize,
            totalCount,
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error })
    }

}

// API to Delete a project
export const deleteProject = async (req: RequestWithUser, res: Response) => {
    const project_id = req.params.id;

    try {
         //check if the course id is there
         if (!project_id) {
            return res.status(400).json({ error: "Project id is required" });
        }

        //you can only delete the course if you are the creator of the course
        const user_id = req.user?.id as string;

        //deleting the course
        await prisma.project.delete({
            where: {
                id: project_id,
            },
        });

        return res.status(200).json({message: "Deleted Successfully!"});
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};
import * as dotenv from 'dotenv'
dotenv.config()
import { createRedisClient } from './config/redisConfig'
import { getAllFilesFromCloud, copyFinalDist } from './utills/supabaseStorage';
import { buildProject, installDependencies } from './utills/buildAndContainerize';

async function main(){
    const subscriber = await createRedisClient();
    console.log("Running!")
    while(1) {
        const res = await subscriber.brPop(
            'build-queue',
            0
        )
        console.log(res)
        // @ts-ignore;
        const {path_location, build_folder, username, project_id} = JSON.parse(res.element)
        console.log(path_location, build_folder, username, project_id)

        //bringing all the files supabase storage path_location to locally.
        await getAllFilesFromCloud(path_location)
        console.log("All files and folders uploaded!")

        await installDependencies(path_location);

        await buildProject(path_location)

        console.log("Build Successful")

        await copyFinalDist(path_location, build_folder, username, project_id);
        // publisher.hSet("status", id, "deployed")
    }
}

main()
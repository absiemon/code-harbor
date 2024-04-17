// //function to upload the file to supabase object storage
import * as dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs-extra'
import * as path from 'path'
import { Blob } from 'buffer'
import { getAllFiles } from './getAllFilesFolder'

// Create Supabase client
const project_url = process.env.SUPABASE_PROJECT_URL as string;
const supabase_api_key = process.env.SUPABASE_API_KEY as string;

//initiating supabase object storage.
const supabase = createClient(project_url, supabase_api_key)

//function to upload files to supabase object storage
export const uploadFile = async (localfile_path: string) => {
     try {
          const fileContent = fs.readFileSync(localfile_path);

          const data = await supabase.storage.from('code-harbor').upload(localfile_path, fileContent)
     } catch (error) {
          throw new Error(error as string)
     }
};


//function to get all the files from a directory of the supabase object storage.
export const getAllFilesFromCloud = async (path_location: string) => {
     try {
          const { data, error } = await supabase.storage.from('code-harbor').list(path_location);
          if (error) {
               throw new Error(error.message);
          }

          if (data && data.length > 0) {

               // Download each file to the destination directory
               for (const file of data) {
                    const filePath = path_location + '/' + file.name;

                    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

                    const { data, error } = await supabase.storage.from('code-harbor').download(filePath);
                    if (!data) {
                         // console.log(filePath)
                         //recursive call to get the files from sub directories
                         await getAllFilesFromCloud(filePath)
                         continue;
                    }
                    console.log(data)

                    const buffer = await data.arrayBuffer(); // Convert Blob to ArrayBuffer
                    const content = Buffer.from(buffer); // Create Buffer from ArrayBuffer

                    await fs.promises.writeFile(filePath, content);
               }
          }
          else {
               console.log('No files found in the specified location');
          }

     } catch (error) {
          throw new Error(error as string)
     }
};

//function to upload files to supabase object storage
export const copyFinalDist = async (localfile_path: string, build_folder: string, username: string, project_id: string) => {
     try {

          const distLocalPath = path.join(localfile_path, build_folder)
          const finalLocationOfDist = path.join(username, 'build', project_id)

          await fs.ensureDir(path.join(username, 'build'));
          await fs.ensureDir(finalLocationOfDist);

          await fs.copy(distLocalPath, finalLocationOfDist);

          console.log('All files and folder copied successfully.');

          const allFiles = getAllFiles(finalLocationOfDist)

          console.log(allFiles)

          console.log("Uploading Build to supabase storage...")

          // uploading all build files
          allFiles.forEach(async (file)=>{
               await uploadFile(file)
          })

          console.log("Build folder uploaded to supabase storage!")
          return;
          
     } catch (error) {
          throw new Error(error as string)
     }
};


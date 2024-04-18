// //function to upload the file to supabase object storage
import * as dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
// Create Supabase client
const project_url = process.env.SUPABASE_PROJECT_URL as string;
const supabase_api_key = process.env.SUPABASE_API_KEY as string;


//function to get a file from the supabase storage.

export const getAFile = async (fileName: string, project_id) => {
     try {
        const supabase = createClient(project_url, supabase_api_key)
        const path  = `abhay1222/build/${project_id}/${fileName}`;
        const {data, error} = await supabase.storage.from('code-harbor').download(path)
        return data
    } catch (error) {
          throw new Error(error as string)
    }
}



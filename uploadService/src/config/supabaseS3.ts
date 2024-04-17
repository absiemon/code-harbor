// //function to upload the file to supabase object storage
import * as dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
// Create Supabase client
const project_url = process.env.SUPABASE_PROJECT_URL as string;
const supabase_api_key = process.env.SUPABASE_API_KEY as string;

export const uploadFile = async (localfile_path: string) => {
    try {
        const supabase = createClient(project_url, supabase_api_key)
        const fileContent = fs.readFileSync(localfile_path);
        const data = await supabase.storage.from('code-harbor').upload(localfile_path, fileContent)
   } catch (error) {
        throw new Error(error as string)
   }
};

import { exec, spawn } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";

//Function to install dependencies
export function installDependencies(path_location: string) {
  return new Promise((resolve, reject) => {
    console.log(`Installing dependencies...`);

    const child = exec(`cd ${path_location} && npm install`);

    child.stdout?.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    child.stderr?.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    child.on('close', function (code) {
      if (code === 0) {
        console.log("Dependencies install successful");
        resolve("");
      } else {
        console.error(`Dependencies installation failed with code ${code}`);
        reject(new Error(`Dependencies installation failed with code ${code}`));
      }
    });

    // Handle errors during child process creation
    child.on('error', function (err) {
      console.error('Error in executing npm install:', err);
      reject(err);
    });
  });

}

//Function to build and containerize the project
export function buildProject(path_location: string) {
  return new Promise(async (resolve, reject) => {
    console.log(`Building project in directory: ${path_location}`);

    // Read package.json 
    const packageJson = await fs.readFile(`${path_location}/package.json`, "utf-8");
    if (packageJson) {
      const packageData = JSON.parse(packageJson);
      // Checking for build script existence
      if (!packageData.scripts || !packageData.scripts.build) {
        console.warn("Build script not found in package.json. Skipping build step.");
        resolve("")
      }
    }

    const child = exec(`cd ${path_location} && npm run build`);

    child.stdout?.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    child.stderr?.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    child.on('close', function (code) {
      if (code === 0) {
        console.log("Project build successful");
        resolve("");
      } else {
        console.error(`Project build failed with code ${code}`);
        reject(new Error(`Project build failed with code ${code}`));
      }
    });

    // Handle errors during child process creation
    child.on('error', function (err) {
      console.error('Error executing npm install:', err);
      reject(err);
    });
  });
}















// import { exec } from "child_process";
// import { promises as fs } from "fs"; // Import for path verification (optional)
// import path from "path";

// export async function buildProject(path_location: string) {
//   try {
//     // Verify project directory existence (optional)
//     await fs.access(path_location, fs.constants.F_OK); // Check if directory exists

//     const installProcess = exec(`cd ${path_location} && npm install`)

//     // Read package.json (optional)
//     const packageJson = await fs.readFile(`${path_location}/package.json`, "utf-8");
//     if (packageJson) {
//       const packageData = JSON.parse(packageJson);
//       // Checking for build script existence
//       if (!packageData.scripts || !packageData.scripts.build) {
//         console.warn("Build script not found in package.json. Skipping build step.");
//       }
//     }

//     const buildProcess = exec(`cd ${path_location} && npm run build`)

//     // Handle output and errors from both processes
//     installProcess.stdout?.on("data", (data) => console.log("npm install stdout:", data.toString()));
//     installProcess.stderr?.on("error", (error) => console.error("npm install error:", error));
//     buildProcess.stdout?.on("data", (data) => console.log("npm run build stdout:", data.toString()));
//     buildProcess.stderr?.on("error", (error) => console.error("npm run build error:", error));

//     // Wait for both processes to finish before resolving
//     await Promise.all([installProcess, buildProcess].map((process) => new Promise((resolve) => process.on("close", resolve))));

//     console.log("Project build completed successfully");
//     return; // Or handle success differently

//   } catch (error) {
//     console.error("Error during build process:", error);
//     throw error; // Re-throw for further handling (optional)
//   }
// }

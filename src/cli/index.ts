import { Command } from "commander";

interface CLIOptions{
    key?:string;
    dir:string;
    output:string;
    title?:string;
    description?:string;
    version?:string;
}

export default function parseCLI():CLIOptions{
    const program:Command = new Command()

    program
    .name("documind")
    .description("AI-Powered Swagger/OpenAPI Documentation Generator for Express.js")
    .version("1.0.0","-v, --version" , "--version for version of documind CLI");

    program
    .option('-d, --dir [directory]', 'The directory to scan for Express routes', './')
    .option('-k, --key <api-key>', 'Your Gemini API Key (Alternative to .env)')
    .option('-o, --output [file-name]', 'The output file name', 'swagger.yaml')
    .option('--title [title]', 'API Documentation Title')
    .option('--api-version [version]', 'API Document Version')
    .option('--desc [description]', 'API Description');
    program.parse(process.argv);

    return program.opts<CLIOptions>();
}
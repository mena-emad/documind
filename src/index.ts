#!/usr/bin/env node

import parseCLI from './cli/index.js';
import { AIService } from './services/aiService.js';
import scanDirectory from './parser/fileScanner.js';
import isExpressRouteFile from './parser/routerExtractor.js';
import { writeSwaggerFile } from './utils/fileWriter.js';
import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';

/**
 * Entry point for the DocuMind CLI.
 * It scans the project, sends merged route context to Gemini, merges responses, and writes the output file.
 */
async function main() {
    console.log("🧠 Welcome to DocuMind! Let's build some magic...\n");

    const options = parseCLI();

    let aiService: AIService;
    try {
        aiService = new AIService(options.key);
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }

    let dirInput: string = './';
    if (typeof options.dir === 'string') {
        dirInput = options.dir;
    }

    const targetDir = path.resolve(dirInput);
    const outputFileName = typeof options.output === 'string' ? options.output : 'swagger.yaml';
    const scanSpinner = ora(`Scanning directory: ${targetDir}`).start();

    const allFiles = scanDirectory(targetDir);
    const validRouteFiles = allFiles.filter(file => isExpressRouteFile(file));
    scanSpinner.succeed(`📁 Found ${allFiles.length} total files. | 🎯 ${validRouteFiles.length} Express controller/route files detected.\n`);

    if (validRouteFiles.length === 0) {
        console.log("⚠️ No valid Express routes or controllers detected to document.");
        return;
    }

    const finalPaths: Record<string, any> = {};
    const finalComponents: Record<string, any> = {};

    for (const file of validRouteFiles) {
        const fileName = path.basename(file);

        if (fileName === 'app.js' || fileName === 'index.js' || fileName === 'server.js') {
            continue;
        }

        const fileSpinner = ora(`Analyzing file: ${fileName}...`).start();
        const fileContent = fs.readFileSync(file, 'utf8');
        const prefix = fileName.split('.')[0] || '';
        let additionalContext = '';

        const relatedFiles = allFiles.filter(f => {
            const name = path.basename(f).toLowerCase();
            return name.startsWith(prefix.toLowerCase()) && f !== file;
        });

        for (const related of relatedFiles) {
            const relName = path.basename(related);
            if (relName.includes('service') || relName.includes('controller') || relName.includes('validation') || relName.includes('model')) {
                fileSpinner.text = `🔗 Injecting context into ${fileName} from: ${relName}`;
                additionalContext += `\n\n[Attached Related Context - ${relName}]:\n${fs.readFileSync(related, 'utf8')}`;
            }
        }

        const totalPayload = fileContent + additionalContext;
        fileSpinner.text = `⏳ Waiting for Gemini to generate docs for ${fileName}...`;

        try {
            const docResult = await aiService.generateDoc(totalPayload);
            fileSpinner.stop();
            fileSpinner.start(`Processing and merging JSON data for ${fileName}...`);

            const aiJson = JSON.parse(docResult);

            if (aiJson.paths && Object.keys(aiJson.paths).length > 0) {
                Object.assign(finalPaths, aiJson.paths);
            } else {
                const upperPaths = aiJson.Paths || aiJson.PATHS;
                if (upperPaths) Object.assign(finalPaths, upperPaths);
            }

            if (aiJson.components) {
                if (aiJson.components.schemas) {
                    finalComponents.schemas = {
                        ...finalComponents.schemas,
                        ...aiJson.components.schemas
                    };
                }
                for (const key of Object.keys(aiJson.components)) {
                    if (key !== 'schemas') {
                        finalComponents[key] = {
                            ...finalComponents[key],
                            ...aiJson.components[key]
                        };
                    }
                }
            }

            fileSpinner.succeed(`✅ ${fileName} parsed and merged successfully.`);
        } catch (err) {
            fileSpinner.fail(`❌ Failed to parse AI response for ${fileName}. Raw response structure invalid.`);
        }
    }

    const totalData = {
        openapi: '3.0.0',
        paths: finalPaths,
        ...(Object.keys(finalComponents).length > 0 ? { components: finalComponents } : {})
    };

    console.log('\n🚀 Final Data Object Structure Ready.');

    const writeSpinner = ora('Writing final Swagger documentation...').start();
    try {
        writeSwaggerFile(outputFileName, totalData, {
            title: typeof options.title === 'string' ? options.title : undefined,
            version: typeof (options as any).apiVersion === 'string' ? (options as any).apiVersion : undefined,
            desc: typeof (options as any).desc === 'string' ? (options as any).desc : undefined
        });
        writeSpinner.succeed(`🎉 Success! Swagger documentation saved to: ${outputFileName}`);
    } catch (writeError) {
        writeSpinner.fail('❌ Failed to write the documentation file.');
    }
}

main();
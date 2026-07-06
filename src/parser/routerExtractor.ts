import * as fs from 'fs';

/**
 * دالة ذكية تفحص محتوى الملف وتحدد هل هو ملف Express Controller/Router حقيقي يستحق الـ Documentation أم لا
 * @param filePath المسار الكامل للملف المراد فحصه
 * @returns boolean (true لو الملف يحتوي على كود إكسبريس حقيقي)
 */
export default function isExpressRouteFile(filePath: string): boolean {
    if (
        filePath.endsWith('.d.ts') ||
        filePath.includes('.test.') ||
        filePath.includes('.spec.') ||
        filePath.endsWith('tsconfig.json') ||
        filePath.endsWith('package.json')
    ) {
        return false;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasExpress = content.includes('express');
        const hasRouter = content.includes('Router') || content.includes('router.');
        const hasHttpMethods = /router\.(get|post|put|delete|patch)/i.test(content) || /app\.(get|post|put|delete|patch)/i.test(content);
        const hasReqRes = content.includes('req,res') && content.includes('request,response');

        return (hasExpress && hasRouter) || hasHttpMethods || hasReqRes;
    } catch (error) {
        return false;
    }
}
import * as fs from 'fs';

/**
 * دالة ذكية تفحص محتوى الملف وتحدد هل هو ملف Express Controller/Router حقيقي يستحق الـ Documentation أم لا
 * @param filePath المسار الكامل للملف المراد فحصه
 * @returns boolean (true لو الملف يحتوي على كود إكسبريس حقيقي)
 */
export default function isExpressRouteFile(filePath: string): boolean {
    // 1. استبعاد ملفات الـ Types والـ Definitions والـ Tests والـ Configs تماماً
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
        // قراءة محتوى الملف كنص خام
        const content = fs.readFileSync(filePath, 'utf8');

        // 2. تفتيش الكلمات الدلالية الأساسية للإكسبريس
        const hasExpress = content.includes('express');
        const hasRouter = content.includes('Router') || content.includes('router.');
        
        // 3. التفتيش باستخدام الـ Regex على ميثودز الـ HTTP الشهيرة (router.get, app.post, إلخ)
        const hasHttpMethods = /router\.(get|post|put|delete|patch)/i.test(content) || 
                               /app\.(get|post|put|delete|patch)/i.test(content);
        
        // 4. التأكد من وجود باراميترز الـ Request والـ Response بتوع الـ Middleware أو الـ Controller
        const hasReqRes = content.includes('req,res') && content.includes('request,response');

        // معادلة الفلترة السحرية:
        // لازم يكون فيه (إكسبريس أو راوتر أو ميثودز HTTP) + شرط أساسي وجود (req و res) جوه الكود
        return (hasExpress && hasRouter) || hasHttpMethods || hasReqRes;
    } catch (error) {
        // لو حصلت مشكلة في قراءة الملف (مثلاً صلاحيات أو ملف معطوب) بنرجّع false عشان الأداة متقَفِلش
        return false;
    }
}
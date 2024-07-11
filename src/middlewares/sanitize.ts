import { Request, Response, NextFunction } from 'express'; 
import sanitizeHtml from 'sanitize-html';

export function sanitize(req: Request, res: Response, next: NextFunction) {

    const sanitized = (obj: any) => {
        if (typeof obj === 'string') {
            return sanitizeHtml(obj);
        }
        if (typeof obj === 'object') {
            const sanitizedObject: any = {};
            for (const key in obj) {
                sanitizedObject[key] = sanitized(obj[key]);
            }
            return sanitizedObject;
        }
        return obj;        
    }

    req.body = sanitized(req.body);
    req.params = sanitized(req.params);
    req.query = sanitized(req.query);

    next();
}



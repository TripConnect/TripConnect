// @ts-check

import * as path from 'path';

const filePath = process.env.UPLOAD_DIRECTORY as string;
const fileUrl = new URL(`file://${path.resolve(filePath)}`);
export default fileUrl;

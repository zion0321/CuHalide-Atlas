import publicDataHandler from './public-data.js';

const WARNING='299 - Legacy /api/data route exposes only the minimized public query contract; prefer /api/public-data.';

export default async function handler(req,res){
  res.setHeader('Warning',WARNING);
  return publicDataHandler(req,res);
}

import express from 'express';

const router = express.Router();

router.get('/:path', (req, res) => {
  const pathToRedirect = req.url.substring(req.url.lastIndexOf('/redirect/'));

  console.log(`Redirecting to path: ${pathToRedirect}`);
  res.redirect(`twitsnap://${pathToRedirect}`);
});

export default router;

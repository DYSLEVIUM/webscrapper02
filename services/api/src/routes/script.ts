import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
    res.status(200).send({
        message: 'You reached script.',
        error: null,
        data: null,
    });
});

export default router;

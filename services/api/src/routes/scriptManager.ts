import { Request, Response, Router } from 'express';
import { ExpressError } from '../shared/errors/express';
import { APIResponse } from '../shared/interfaces';
import { ScriptManager } from '../shared/models';

const router = Router();

router.get('/', (_req, res: Response<APIResponse>) => {
    res.status(200).send({
        message: 'You reached script manager.',
        data: null,
        error: null,
    });
});

// we have to call next, if the function is async so that it doesn't lead to unhandled promise rejections

router.post('/create', async (req, res: Response<APIResponse>, next) => {
    const {
        name,
        condition,
        targetPriceMin,
        targetPriceMax,
        keywords,
        runFreq,
    } = req.body;

    if (
        !name ||
        name === '' ||
        !keywords ||
        keywords === '' ||
        (!targetPriceMin && targetPriceMin !== 0) ||
        isNaN(targetPriceMin) ||
        (!targetPriceMax && targetPriceMax !== 0) ||
        isNaN(targetPriceMax) ||
        parseFloat(targetPriceMin) > parseFloat(targetPriceMax) ||
        !runFreq ||
        isNaN(runFreq)
    ) {
        res.status(200).send({
            message: 'Malformed data.',
            data: null,
            error: null,
        });
        return;
    }

    try {
        console.log('Here in the create 2');
        res.status(200).send({
            message: 'Scrapper started.',
            data: await ScriptManager.addScript(
                name,
                parseFloat(targetPriceMin),
                parseFloat(targetPriceMax),
                condition ? condition : '',
                keywords,
                parseFloat(runFreq)
            ),
            error: null,
        });
    } catch (err) {
        console.log('Here in the create 3');
        next(
            new ExpressError(
                `Error while running scrapper for keywords: "${keywords}" and Target Price: $${targetPriceMin} - ${targetPriceMax}.`,
                err
            )
        );
    }
});

router.post('/start/all', async (_req, res: Response<APIResponse>, next) => {
    try {
        res.status(200).send({
            message: 'All scrapper started.',
            data: await ScriptManager.startAllScripts(),
            error: null,
        });
    } catch (err) {
        next(new ExpressError(`Error while starting all scrappers.`, err));
    }
});

router.post(
    '/start/ids',
    async (
        req: Request<{}, {}, { ids: string[] }>,
        res: Response<APIResponse>,
        next
    ) => {
        const ids = req.body.ids;

        try {
            res.status(200).send({
                message: `Scrapper ${ids.join(', ')} started.`,
                data: await Promise.allSettled(
                    ids.map((id) => ScriptManager.startScript(id))
                ),
                error: null,
            });
        } catch (err) {
            next(
                new ExpressError(
                    `Error while starting script ${ids.join(', ')}.`,
                    err
                )
            );
        }
    }
);

router.post('/stop/all', async (_req, res: Response<APIResponse>, next) => {
    try {
        res.status(200).send({
            message: 'All scrappers stopped.',
            data: await ScriptManager.stopAllScripts(),
            error: null,
        });
    } catch (err) {
        next(new ExpressError(`Error while stopping all scrappers.`, err));
    }
});

router.post(
    '/stop/ids',
    async (
        req: Request<{}, {}, { ids: string[] }>,
        res: Response<APIResponse>,
        next
    ) => {
        const ids = req.body.ids;

        try {
            res.status(200).send({
                message: `Scrapper ${ids.join(', ')} stopped.`,
                data: await Promise.allSettled(
                    ids.map((id) => ScriptManager.stopScript(id))
                ),
                error: null,
            });
        } catch (err) {
            next(
                new ExpressError(
                    `Error while stopping script ${ids.join(', ')}.`,
                    err
                )
            );
        }
    }
);

router.get('/all', (_req, res: Response<APIResponse>) => {
    res.status(200).send({
        message: 'All scrappers fetched.',
        data: ScriptManager.getAllScripts(),
        error: null,
    });
});

router.get('/:id', (req, res: Response<APIResponse>) => {
    const id = req.params.id;
    res.status(200).send({
        message: `Scrapper data of ${id} fetched.`,
        data: ScriptManager.getScript(id) || null,
        error: null,
    });
});

router.post('/remove/all', async (_req, res: Response<APIResponse>, next) => {
    try {
        res.status(200).send({
            message: 'All scrappers removed.',
            data: await ScriptManager.removeAllScripts(),
            error: null,
        });
    } catch (err) {
        next(new ExpressError(`Error while removing all scrappers.`, err));
    }
});

router.post(
    '/remove/ids',
    async (
        req: Request<{}, {}, { ids: string[] }>,
        res: Response<APIResponse>,
        next
    ) => {
        const ids = req.body.ids;

        try {
            res.status(200).send({
                message: `Scrapper ${ids.join(', ')} removed.`,
                data: await Promise.allSettled(
                    ids.map((id) => ScriptManager.removeScript(id))
                ),
                error: null,
            });
        } catch (err) {
            next(
                new ExpressError(
                    `Error while removing script ${ids.join(', ')}.`,
                    err
                )
            );
        }
    }
);

export default router;

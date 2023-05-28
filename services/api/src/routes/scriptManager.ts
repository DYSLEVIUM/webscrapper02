import { Response, Router } from 'express';
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
    const { name, targetPrice, keywords, runFreq } = req.body;

    if (
        !name ||
        name === '' ||
        !keywords ||
        keywords === '' ||
        !targetPrice ||
        isNaN(targetPrice) ||
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
        res.status(200).send({
            message: 'Scrapper started.',
            data: await ScriptManager.addScript(
                name,
                parseFloat(targetPrice),
                keywords,
                parseFloat(runFreq)
            ),
            error: null,
        });
    } catch (err) {
        next(
            new ExpressError(
                `Error while running scrapper for keywords: "${keywords}" and Target Price: $${targetPrice}.`,
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

router.post('/start/:id', async (req, res: Response<APIResponse>, next) => {
    const id = req.params.id;
    try {
        res.status(200).send({
            message: `Scrapper ${id} started.`,
            data: await ScriptManager.startScript(id),
            error: null,
        });
    } catch (err) {
        next(new ExpressError(`Error while starting script ${id}.`, err));
    }
});

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

router.post('/stop/:id', async (req, res: Response<APIResponse>, next) => {
    const id = req.params.id;
    try {
        res.status(200).send({
            message: `Scrapper ${id} stopped.`,
            data: await ScriptManager.stopScript(id),
            error: null,
        });
    } catch (err) {
        next(new ExpressError(`Error while stopping scrapper ${id}.`, err));
    }
});

router.get('/all', (_req, res: Response<APIResponse>) => {
    res.status(200).send({
        message: 'All scrappers fetched.',
        error: null,
        data: ScriptManager.getAllScripts(),
    });
});

router.get('/:id', (req, res: Response<APIResponse>) => {
    const id = req.params.id;
    res.status(200).send({
        message: `Scrapper data of ${id} fetched.`,
        error: null,
        data: ScriptManager.getScript(id) || null,
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

router.post('/remove/:id', async (req, res: Response<APIResponse>, next) => {
    const id = req.params.id;
    try {
        res.status(200).send({
            message: `Scrapper ${id} removed.`,
            data: await ScriptManager.removeScript(id),
            error: null,
        });
    } catch (err) {
        next(new ExpressError(`Error while removing scrapper ${id}.`, err));
    }
});

export default router;

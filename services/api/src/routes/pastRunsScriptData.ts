import { Request, Response, Router } from 'express';
import { ExpressError } from '../shared/errors/express';
import { APIResponse } from '../shared/interfaces';
import { ScriptManager } from '../shared/models';

const router = Router();

router.get('/', (_req, res: Response<APIResponse>) => {
    res.status(200).send({
        message: 'You reached past script data.',
        data: null,
        error: null,
    });
});

router.post(
    '/data',
    async (
        req: Request<{}, {}, { scriptId: string; runNumber: number }>,
        res: Response<APIResponse>,
        next
    ) => {
        const scriptId = req.body.scriptId,
            runNumber = req.body.runNumber;

        if (!runNumber || isNaN(runNumber)) {
            res.status(200).send({
                message: 'Malformed data.',
                data: null,
                error: null,
            });
            return;
        }

        const script = ScriptManager.getScript(scriptId);
        if (!script) {
            res.status(200).send({
                message: 'Script does not exist.',
                data: null,
                error: null,
            });
            return;
        }

        try {
            res.status(200).send({
                message: `Scrapper ${scriptId} run data fetched.`,
                data: {
                    script,
                    products: await script.getScriptDiffFromRunNumber(
                        Number(runNumber)
                    ),
                },
                error: null,
            });
        } catch (err) {
            next(
                new ExpressError(
                    `Error while fetching run data for script ${scriptId}.`,
                    err
                )
            );
        }
    }
);

export default router;

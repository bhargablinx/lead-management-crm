import type { Request, Response } from "express";

const checkHealth = (req: Request, res: Response) => {
    res.status(200).json({ message: "ok" });
};

export { checkHealth };

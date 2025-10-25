// src/modules/departments/department.routes.ts
import { Router } from "express";
import { prisma } from "../../core/config/database.js";
;

const router = Router();

/**
 * GET /api/departments
 * Devuelve todos los departamentos (id y nombre)
 */
router.get("/", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { id: "asc" },
    });

    res.json({ success: true, data: departments });
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno al obtener departamentos",
      },
    });
  }
});

export default router;

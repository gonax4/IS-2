import { prisma } from "../config/prisma";

const closureReasons = [
  {
    name: "Resuelto en sitio",
    description:
      "La incidencia fue atendida y solucionada completamente durante la intervención técnica.",
  },
  {
    name: "Mitigación temporal aplicada",
    description:
      "Se aplicó una solución provisional para reducir el impacto mientras se programa una atención definitiva.",
  },
  {
    name: "No se encontró la incidencia",
    description:
      "El técnico acudió al lugar, pero no encontró evidencia de la incidencia reportada.",
  },
  {
    name: "Reporte duplicado",
    description:
      "La incidencia corresponde a un reporte previamente registrado o atendido.",
  },
  {
    name: "Fuera del alcance municipal",
    description:
      "La incidencia no puede ser atendida directamente por la municipalidad y debe derivarse a otra entidad.",
  },
  {
    name: "Requiere seguimiento",
    description:
      "La incidencia no pudo cerrarse completamente y requiere una nueva evaluación o intervención posterior.",
  },
];

async function main() {
  for (const reasonData of closureReasons) {
    await prisma.closureReason.upsert({
      where: {
        name: reasonData.name,
      },
      update: {
        description: reasonData.description,
        active: true,
      },
      create: {
        name: reasonData.name,
        description: reasonData.description,
        active: true,
      },
    });
  }

  console.log(
    "Catálogo base de motivos de cierre cargado correctamente sin eliminar motivos nuevos."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
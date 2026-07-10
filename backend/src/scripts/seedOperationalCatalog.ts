import { prisma } from "../config/prisma";

const catalog = [
  {
    name: "Infraestructura y servicios",
    description:
      "Problemas relacionados con pistas, veredas, alumbrado, señalización y servicios urbanos.",
    problemTypes: [
      "Alumbrado público defectuoso",
      "Pistas en mal estado",
      "Veredas en mal estado",
      "Semáforos inoperativos",
      "Señalización dañada",
    ],
  },
  {
    name: "Seguridad ciudadana",
    description:
      "Incidencias relacionadas con seguridad, convivencia y orden público.",
    problemTypes: [
      "Robos y asaltos",
      "Consumo de alcohol en la vía pública",
      "Venta ambulante no autorizada",
      "Personas sospechosas",
      "Ruidos molestos",
    ],
  },
  {
    name: "Ambiente y limpieza",
    description:
      "Problemas relacionados con basura, contaminación, áreas verdes y limpieza pública.",
    problemTypes: [
      "Acumulación de basura",
      "Mal olor en la vía pública",
      "Contaminación de áreas verdes",
      "Residuos fuera de contenedores",
      "Quema de residuos",
    ],
  },
  {
    name: "Movilidad y tránsito",
    description:
      "Incidencias relacionadas con tránsito, transporte, estacionamiento y circulación vehicular.",
    problemTypes: [
      "Congestión vehicular",
      "Estacionamiento en zonas prohibidas",
      "Transporte público deficiente",
      "Autos abandonados",
      "Exceso de velocidad",
    ],
  },
];

async function main() {
  for (const categoryData of catalog) {
    const category =
      await prisma.category.upsert({
        where: {
          name: categoryData.name,
        },
        update: {
          description: categoryData.description,
          active: true,
        },
        create: {
          name: categoryData.name,
          description: categoryData.description,
          active: true,
        },
      });

    for (const problemTypeName of categoryData.problemTypes) {
      const existingProblemType =
        await prisma.problemType.findFirst({
          where: {
            name: problemTypeName,
            categoryId: category.id,
          },
        });

      if (existingProblemType) {
        await prisma.problemType.update({
          where: {
            id: existingProblemType.id,
          },
          data: {
            active: true,
          },
        });
      } else {
        await prisma.problemType.create({
          data: {
            name: problemTypeName,
            description:
              `Tipo de problema asociado a ${category.name}.`,
            categoryId: category.id,
            active: true,
          },
        });
      }
    }
  }

  console.log(
    "Catálogo operativo base cargado correctamente."
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
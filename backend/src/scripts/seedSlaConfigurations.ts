import {
  Priority,
} from "@prisma/client";

import {
  prisma,
} from "../config/prisma";

async function main() {
  const configurations = [
    {
      priority:
        Priority.ALTO,

      responseHours:
        24,
    },
    {
      priority:
        Priority.MEDIO,

      responseHours:
        48,
    },
    {
      priority:
        Priority.BAJO,

      responseHours:
        72,
    },
  ];

  for (const configuration of configurations) {
    await prisma.slaConfiguration.upsert({
      where: {
        priority:
          configuration.priority,
      },

      update: {
        responseHours:
          configuration.responseHours,
      },

      create: {
        priority:
          configuration.priority,

        responseHours:
          configuration.responseHours,
      },
    });
  }

  console.log(
    "Configuraciones SLA cargadas correctamente."
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
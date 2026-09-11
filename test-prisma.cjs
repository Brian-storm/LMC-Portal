/* eslint-disable @typescript-eslint/no-require-imports -- .cjs debug script is intentionally CommonJS */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.course
  .findUnique({
    where: { slug: "CPD26090103" },
    include: {
      instructors: { include: { instructor: true } },
      syllabusItems: { orderBy: { sortOrder: "asc" } },
      schedules: {
        where: { isActive: true },
        orderBy: { dateAndTime: "asc" },
        include: {
          topics: { include: { syllabusItem: true }, orderBy: { sortOrder: "asc" } },
        },
      },
      reviews: { orderBy: { date: "desc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  })
  .then((c) => {
    if (!c) {
      console.log("NOT FOUND");
    } else {
      console.log("FOUND", c.id, c.nameZh, "schedules:", c.schedules.length);
      c.schedules.forEach((s) => {
        console.log("  sch:", s.id, s.dateAndTime, "topics:", s.topics.length);
        s.topics.forEach((t) => {
          console.log("    topic:", t.syllabusItem.moduleNumber, t.syllabusItem.titleZh);
        });
      });
    }
  })
  .catch((e) => {
    console.error("ERROR:", e.message);
    if (e.meta) console.error("META:", JSON.stringify(e.meta));
  })
  .finally(() => p.$disconnect());
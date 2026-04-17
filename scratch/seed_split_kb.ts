import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: "devcomplete" }
  });

  if (!org) throw new Error("Organization not found");

  const admin = await prisma.user.findFirst({
    where: { organizationId: org.id, role: "ADMIN" }
  });

  if (!admin) throw new Error("Admin not found");

  // 1. Create Public Category
  const pcCategory = await prisma.articleCategory.upsert({
    where: { slug: "pc-maintenance" },
    update: {},
    create: {
      name: "PC Maintenance",
      slug: "pc-maintenance",
      description: "Generic tips for keeping your computer running smoothly.",
      organizationId: org.id,
      order: 1
    }
  });

  // 2. Clear previous seeded articles that might conflict or just update them
  await prisma.article.updateMany({
    where: { organizationId: org.id, slug: "using-macros" },
    data: { audience: "INTERNAL" }
  });

  await prisma.article.updateMany({
    where: { organizationId: org.id, slug: "understanding-sla-deadlines" },
    data: { audience: "INTERNAL" }
  });

  // 3. Seed Generic PC Fixes (PUBLIC)
  const publicArticles = [
    {
      title: "How to Clean Your PC Safely",
      slug: "how-to-clean-pc",
      excerpt: "Step-by-step guide to removing dust and grime from your hardware.",
      content: `Maintaining a clean PC is essential for performance and longevity. 

1. **Power Off**: Always unplug your computer before cleaning.
2. **Compressed Air**: Use short bursts of compressed air to remove dust from fans and heat sinks.
3. **Microfiber Cloth**: Use a slightly damp microfiber cloth for the exterior casing.
4. **Avoid Liquids**: Never spray cleaning agents directly onto the hardware.

Regular cleaning prevents overheating and hardware failure.`,
      keywords: "cleaning, hardware, maintenance",
      audience: "PUBLIC",
      isPublished: true,
      categoryId: pcCategory.id
    },
    {
      title: "Troubleshooting Slow Performance",
      slug: "slow-pc-fixes",
      excerpt: "Common solutions for a sluggish computer.",
      content: `If your computer feels slow, try these basic steps:

- **Check Startup Apps**: Disable unnecessary programs that run at boot.
- **Clear Disk Space**: Remove temporary files and uninstall apps you don't use.
- **Update Drivers**: Ensure your graphics and chipset drivers are up to date.
- **Check for Malware**: Run a quick scan with your security software.

If issues persist, please open a support ticket with our team.`,
      keywords: "slow, performance, windows, fixes",
      audience: "PUBLIC",
      isPublished: true,
      categoryId: pcCategory.id
    },
    {
      title: "Guide to Basic Windows Updates",
      slug: "windows-update-guide",
      excerpt: "Keeping your operating system secure and stable.",
      content: `Updates are critical for your system's security.

1. Go to **Settings > Windows Update**.
2. Click **Check for updates**.
3. Install any pending updates and restart your computer when prompted.

**Why update?**
- Security patches
- Bug fixes
- New features and compatibility improvements.`,
      keywords: "windows, update, security, microsoft",
      audience: "PUBLIC",
      isPublished: true,
      categoryId: pcCategory.id
    }
  ];

  for (const art of publicArticles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: { ...art },
      create: {
        ...art,
        organizationId: org.id,
        authorId: admin.id,
        status: "PUBLISHED",
        publishedAt: new Date()
      }
    });
  }

  console.log("Seeding complete: Public and Internal KB content separated.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

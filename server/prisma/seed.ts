import { prisma } from '../src/config/db'

const projects = [
  {
    title: 'Press Freedom in Myanmar',
    description:
      'Reporters Without Borders supports local journalists facing imprisonment and censorship under the military junta. This project funds legal assistance, secure communication tools, and emergency evacuations for reporters at risk.',
    theme: 'FREEDOM_OF_PRESS' as const,
    country: 'Myanmar',
    continent: 'ASIA' as const,
    associationName: 'Reporters Without Borders (RSF)',
    associationUrl: 'https://rsf.org',
    imageUrl: null,
    latitude: 19.7633,
    longitude: 96.0785,
    status: 'URGENT' as const,
  },
  {
    title: 'Emergency Medical Care in Gaza',
    description:
      'Médecins Sans Frontières provides emergency surgical care, trauma treatment, and mental health support to civilians affected by the conflict. Teams operate mobile clinics and field hospitals across the territory.',
    theme: 'HEALTH' as const,
    country: 'Palestine',
    continent: 'ASIA' as const,
    associationName: 'Médecins Sans Frontières (MSF)',
    associationUrl: 'https://www.msf.org',
    imageUrl: null,
    latitude: 31.3547,
    longitude: 34.3088,
    status: 'URGENT' as const,
  },
  {
    title: 'Combating Arbitrary Detention in Iran',
    description:
      'Amnesty International documents and campaigns against the arbitrary detention of activists, journalists, and minorities in Iran. The project funds legal observers, family support networks, and international advocacy campaigns.',
    theme: 'HUMAN_RIGHTS' as const,
    country: 'Iran',
    continent: 'ASIA' as const,
    associationName: 'Amnesty International',
    associationUrl: 'https://www.amnesty.org',
    imageUrl: null,
    latitude: 32.4279,
    longitude: 53.6880,
    status: 'ACTIVE' as const,
  },
  {
    title: 'Clean Water Access in Sub-Saharan Africa',
    description:
      'UNICEF works to provide safe drinking water and sanitation infrastructure to rural communities across Sub-Saharan Africa. The project drills boreholes, installs hand pumps, and trains local maintenance committees.',
    theme: 'HEALTH' as const,
    country: 'Chad',
    continent: 'AFRICA' as const,
    associationName: 'UNICEF',
    associationUrl: 'https://www.unicef.org',
    imageUrl: null,
    latitude: 15.4542,
    longitude: 18.7322,
    status: 'ACTIVE' as const,
  },
  {
    title: 'Amazon Rainforest Preservation',
    description:
      'Greenpeace works alongside indigenous communities to defend the Amazon rainforest from illegal logging and land grabbing. The project funds satellite monitoring, legal challenges, and community ranger programs.',
    theme: 'ENVIRONMENT' as const,
    country: 'Brazil',
    continent: 'AMERICAS' as const,
    associationName: 'Greenpeace',
    associationUrl: 'https://www.greenpeace.org',
    imageUrl: null,
    latitude: -3.4653,
    longitude: -62.2159,
    status: 'ACTIVE' as const,
  },
  {
    title: "Girls' Education in Afghanistan",
    description:
      'Save the Children runs clandestine learning programmes for girls denied access to formal education under Taliban rule. Community educators deliver lessons in safe houses, providing literacy, numeracy, and life skills.',
    theme: 'EDUCATION' as const,
    country: 'Afghanistan',
    continent: 'ASIA' as const,
    associationName: 'Save the Children',
    associationUrl: 'https://www.savethechildren.org',
    imageUrl: null,
    latitude: 33.9391,
    longitude: 67.7100,
    status: 'URGENT' as const,
  },
  {
    title: 'Rohingya Refugee Aid in Bangladesh',
    description:
      "The UNHCR provides shelter, food, and protection services to Rohingya refugees in the Cox's Bazar camps. This project focuses on building flood-resistant shelters and providing psychosocial support to trauma survivors.",
    theme: 'HUMANITARIAN_AID' as const,
    country: 'Bangladesh',
    continent: 'ASIA' as const,
    associationName: 'UNHCR',
    associationUrl: 'https://www.unhcr.org',
    imageUrl: null,
    latitude: 21.4272,
    longitude: 92.0058,
    status: 'ACTIVE' as const,
  },
  {
    title: 'Fighting Child Labour in West Africa',
    description:
      "Anti-Slavery International works to eradicate child labour in cocoa farming across Côte d'Ivoire and Ghana. The project runs school reintegration programmes and supports families with alternative livelihoods.",
    theme: 'HUMAN_RIGHTS' as const,
    country: "Côte d'Ivoire",
    continent: 'AFRICA' as const,
    associationName: 'Anti-Slavery International',
    associationUrl: 'https://www.antislavery.org',
    imageUrl: null,
    latitude: 7.5400,
    longitude: -5.5471,
    status: 'ACTIVE' as const,
  },
  {
    title: 'Coral Reef Restoration in the Pacific',
    description:
      'The Ocean Foundation leads coral reef restoration efforts across French Polynesia and the Cook Islands. Using assisted evolution techniques, the project cultivates heat-resistant coral strains and replants degraded reef systems.',
    theme: 'ENVIRONMENT' as const,
    country: 'French Polynesia',
    continent: 'OCEANIA' as const,
    associationName: 'The Ocean Foundation',
    associationUrl: 'https://oceanfdn.org',
    imageUrl: null,
    latitude: -17.6797,
    longitude: -149.4068,
    status: 'ACTIVE' as const,
  },
  {
    title: 'Post-War School Reconstruction in Ukraine',
    description:
      'CARE International rebuilds and equips schools destroyed by shelling in eastern Ukraine. Beyond construction, the project trains teachers in trauma-informed pedagogy and provides psychological first aid to children.',
    theme: 'EDUCATION' as const,
    country: 'Ukraine',
    continent: 'EUROPE' as const,
    associationName: 'CARE International',
    associationUrl: 'https://www.care-international.org',
    imageUrl: null,
    latitude: 48.3794,
    longitude: 31.1656,
    status: 'URGENT' as const,
  },
]

async function main() {
  console.log('🌱 Seeding projects...')

  // Delete existing projects (cascade pledges)
  await prisma.pledge.deleteMany()
  await prisma.project.deleteMany()

  for (const project of projects) {
    await prisma.project.create({ data: project })
    console.log(`  ✓ ${project.title}`)
  }

  console.log(`\n✅ Seeded ${projects.length} projects successfully.`)
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())